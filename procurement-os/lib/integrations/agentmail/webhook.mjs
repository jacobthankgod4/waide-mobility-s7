/* Webhook verification and event routing.

   AgentMail signs deliveries with Svix. The signature is checked over the raw
   bytes before any field is trusted, because the payload decides what the
   system does next (label, extract, notify). A failed signature is a 401 and
   nothing is written.

   Delivery is at least once, so routing is idempotent: the message id and the
   action label decide whether work has already been done. */

import { createHash } from 'node:crypto'
import { scanInbound } from '../../engines/comms.mjs'
import { loadStore, saveStore, record } from '../../data/store.mjs'
import { webhookSecret } from './client.mjs'

export const HANDLED_EVENTS = [
  'message.received',
  'message.sent',
  'message.delivered',
  'message.bounced',
  'message.complained',
  'message.rejected',
  'domain.verified'
]

function signingSecret(value) {
  const secret = String(value || '')
  return /^whsec_/.test(secret) ? secret : 'whsec_' + secret
}

export function verify(payload, headers) {
  const secret = webhookSecret()
  if (!secret) return { ok: false, status: 503, reason: 'AGENTMAIL_WEBHOOK_SECRET is not set' }

  try {
    const { Webhook } = require('svix')
    const event = new Webhook(signingSecret(secret)).verify(payload, headers)
    return { ok: true, event }
  } catch (error) {
    return { ok: false, status: 401, reason: 'invalid_signature', detail: String(error.message || error).slice(0, 200) }
  }
}

/* svix is CommonJS; a static import in an .mjs module under Next's bundler
   resolves inconsistently between dev and build, so it is required lazily. */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

function mailState(store) {
  if (!store.mail) store.mail = { messages: [], threads: [], documents: [], events: [], sentKeys: [] }
  for (const key of ['messages', 'threads', 'documents', 'events', 'sentKeys']) {
    if (!Array.isArray(store.mail[key])) store.mail[key] = []
  }
  return store.mail
}

function addresses(value) {
  if (!value) return []
  const list = Array.isArray(value) ? value : [value]
  return list
    .map((item) => (item && typeof item === 'object' ? item.email || item.address : item))
    .filter(Boolean)
    .map((item) => String(item).toLowerCase())
}

function messageIdOf(message) {
  return message.messageId || message.message_id || (message.headers && message.headers['message-id']) || null
}

/* Record the message, screen its body, and queue attachments for extraction.
   Nothing in the body is executed: it is data about a supplier, not a command. */
export function ingestInbound(store, message, { source = 'webhook' } = {}) {
  const mail = mailState(store)
  const messageId = messageIdOf(message)
  if (!messageId) return { stored: false, reason: 'no_message_id' }

  const existing = mail.messages.find((entry) => entry.messageId === messageId)
  if (existing) return { stored: false, duplicate: true, record: existing }

  const text = [message.text, message.extractedText, message.html].filter(Boolean).join('\n')
  const screening = scanInbound(text, { sourceType: 'email' })

  const recordEntry = {
    messageId,
    threadId: message.threadId || message.thread_id || null,
    inboxId: message.inboxId || message.inbox_id || null,
    from: addresses(message.from || message.from_)[0] || null,
    to: addresses(message.to),
    subject: message.subject || '',
    receivedAt: message.timestamp || message.createdAt || new Date().toISOString(),
    labels: message.labels || [],
    preview: String(text).replace(/\s+/g, ' ').slice(0, 600),
    bodyHash: createHash('sha256').update(String(text)).digest('hex'),
    attachmentCount: Array.isArray(message.attachments) ? message.attachments.length : 0,
    attachments: (message.attachments || []).map((attachment) => ({
      attachmentId: attachment.attachmentId || attachment.attachment_id,
      filename: attachment.filename,
      contentType: attachment.contentType || attachment.content_type,
      size: attachment.size,
      extracted: false
    })),
    screening,
    source,
    ingestedAt: new Date().toISOString()
  }

  mail.messages.unshift(recordEntry)

  /* Quarantined content is kept but never acted on: no reply, no extraction,
     no supplier record change until compliance reviews it. */
  if (screening.quarantined) {
    recordEntry.status = 'quarantined'
    mail.events.unshift({
      type: 'inbound.quarantined',
      messageId,
      findings: screening.findings.map((finding) => finding.id),
      at: new Date().toISOString()
    })
  } else {
    recordEntry.status = 'received'
  }

  saveStore(store)

  try {
    record({
      type: 'agentmail.inbound',
      messageId,
      from: recordEntry.from,
      subject: recordEntry.subject,
      quarantined: screening.quarantined,
      at: new Date().toISOString()
    })
  } catch (error) {
    /* The store already holds the message; a ledger failure is surfaced in the
       returned object rather than losing the inbound record. */
    recordEntry.ledgerError = error.message
  }

  return { stored: true, record: recordEntry }
}

export function routeEvent(event) {
  const store = loadStore()
  const mail = mailState(store)
  const type = event && event.event_type
  const payload = (event && event.payload) || {}
  const message = (event && event.message) || payload.message || payload

  if (!type) return { ok: false, status: 400, reason: 'missing_event_type' }

  if (type === 'message.received') {
    const result = ingestInbound(store, message, { source: 'webhook' })
    return {
      ok: true,
      handled: result.stored,
      duplicate: Boolean(result.duplicate),
      quarantined: Boolean(result.record && result.record.screening && result.record.screening.quarantined),
      messageId: result.record ? result.record.messageId : null
    }
  }

  /* Delivery lifecycle: recorded so a bounce or complaint is visible against
     the message that caused it, and a rejected send is not silently retried. */
  mail.events.unshift({
    type,
    messageId: messageIdOf(message),
    at: new Date().toISOString()
  })
  saveStore(store)

  try {
    record({ type: 'agentmail.event.' + type, messageId: messageIdOf(message), at: new Date().toISOString() })
  } catch (error) {
    /* Delivery events are informational; the ledger is best effort here. */
  }

  return { ok: true, handled: HANDLED_EVENTS.includes(type), event: type }
}
