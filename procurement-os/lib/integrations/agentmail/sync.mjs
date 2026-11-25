/* Inbox synchronisation and document ingestion.

   Pulling the mailbox is a read: it never replies and never sends. Its job is
   to turn correspondence into procurement record — messages, supplier links,
   and extracted requirements from attachments — with the extraction result
   stored against the message that carried it.

   Attachments are the reason this exists: a supplier's quotation arrives as a
   PDF, and until it is parsed it is an unread file, not a price. */

import { createHash } from 'node:crypto'
import { loadStore, saveStore, record } from '../../data/store.mjs'
import { extractDocument } from '../../extract/pipeline.mjs'
import { call, mailbox } from './client.mjs'
import { ingestInbound } from './webhook.mjs'

/* Match a sender to a supplier already on file. An unknown sender is left
   unknown: guessing a supplier from a display name is how the wrong party gets
   screened and cleared. */
export function matchSupplier(store, address) {
  if (!address) return null
  const email = String(address).toLowerCase()
  const supplier = (store.suppliers || []).find((entry) => {
    const emails = [
      entry.email,
      ...(entry.contactEmails || []),
      ...((entry.contacts || []).map((contact) => contact.email))
    ].filter(Boolean).map((value) => String(value).toLowerCase())
    return emails.includes(email)
  })
  return supplier ? { id: supplier.id, name: supplier.name } : null
}

function mailState(store) {
  if (!store.mail) store.mail = { messages: [], threads: [], documents: [], events: [], sentKeys: [] }
  for (const key of ['messages', 'threads', 'documents', 'events', 'sentKeys']) {
    if (!Array.isArray(store.mail[key])) store.mail[key] = []
  }
  return store.mail
}

/* Persist one extraction against its source. The hash is the identity: the
   same file sent twice is one document, and a changed file is a new version. */
export function storeExtraction(store, result, meta = {}) {
  const mail = mailState(store)
  const existing = mail.documents.find((entry) => entry.sha256 === result.sha256)

  if (existing) {
    if (meta.messageId && !existing.messageIds.includes(meta.messageId)) {
      existing.messageIds.push(meta.messageId)
    }
    saveStore(store)
    return { stored: false, duplicate: true, document: existing }
  }

  const document = {
    id: 'DOC-' + String(result.sha256).slice(0, 10).toUpperCase(),
    sha256: result.sha256,
    filename: result.filename,
    source: meta.source || 'upload',
    messageIds: meta.messageId ? [meta.messageId] : [],
    threadId: meta.threadId || null,
    supplierId: meta.supplierId || null,
    opportunityId: meta.opportunityId || null,
    bytes: result.bytes,
    type: result.type,
    readable: result.readable,
    reason: result.reason || null,
    pageCount: result.pageCount || 0,
    textCharacters: result.textCharacters || 0,
    documentType: result.documentType,
    requirements: result.requirements,
    completeness: result.completeness,
    warnings: result.warnings || [],
    extractedAt: result.extractedAt,
    ingestedAt: new Date().toISOString()
  }

  mail.documents.unshift(document)
  saveStore(store)

  try {
    record({
      type: 'document.extracted',
      documentId: document.id,
      sha256: document.sha256,
      documentType: document.documentType && document.documentType.type,
      readable: document.readable,
      at: new Date().toISOString()
    })
  } catch (error) {
    document.ledgerError = error.message
  }

  return { stored: true, document }
}

function attachmentBytes(payload) {
  if (!payload) return null
  if (Buffer.isBuffer(payload)) return payload
  if (payload instanceof Uint8Array) return Buffer.from(payload)
  if (payload.content) {
    const raw = String(payload.content)
    const base64 = raw.includes(',') && raw.startsWith('data:') ? raw.split(',').pop() : raw
    return Buffer.from(base64, 'base64')
  }
  return null
}

/* Download one attachment and extract it. The attachment may come back as a
   signed URL (large files) or inline bytes; both are handled. */
export async function ingestAttachment({ inboxId, messageId, attachment, supplierId = null }) {
  const attachmentId = attachment.attachmentId || attachment.attachment_id
  if (!attachmentId) return { ok: false, reason: 'no_attachment_id' }

  const fetched = await call('inboxes.messages.getAttachment', inboxId, messageId, attachmentId)
  if (!fetched.ok) return { ok: false, reason: fetched.reason }

  let buffer = attachmentBytes(fetched.data)
  if (!buffer && fetched.data && fetched.data.downloadUrl) {
    const response = await fetch(fetched.data.downloadUrl)
    if (!response.ok) return { ok: false, reason: 'download_failed: HTTP ' + response.status }
    buffer = Buffer.from(await response.arrayBuffer())
  }
  if (!buffer) return { ok: false, reason: 'attachment_body_missing' }

  const result = await extractDocument({ buffer, filename: attachment.filename || attachmentId })
  const store = loadStore()
  const stored = storeExtraction(store, result, {
    source: 'email',
    messageId,
    supplierId,
    opportunityId: null
  })

  return { ok: true, extracted: result.readable, document: stored.document, duplicate: Boolean(stored.duplicate) }
}

export async function syncMailbox({ limit = 25, extract = true } = {}) {
  const box = await mailbox()
  if (!box.ok) return { ok: false, configured: false, reason: box.reason }

  const listed = await call('inboxes.messages.list', box.inboxId, { limit })
  if (!listed.ok) return { ok: false, reason: listed.reason, status: listed.status }

  const messages = (listed.data && (listed.data.messages || listed.data)) || []
  const store = loadStore()
  const mail = mailState(store)

  let newMessages = 0
  let quarantined = 0
  const toExtract = []

  for (const message of messages) {
    const sender = (message.from || message.from_ || '')
    const address = typeof sender === 'string' ? sender : (sender && sender.email) || ''
    const supplier = matchSupplier(store, address)
    const result = ingestInbound(store, message, { source: 'sync' })

    if (result.stored) {
      newMessages += 1
      if (result.record.status === 'quarantined') quarantined += 1
      if (result.record.supplierId === undefined && supplier) {
        result.record.supplier = supplier
      }
      if (supplier) result.record.supplierId = supplier.id

      /* Only clean, linked correspondence is extracted automatically. A
         quarantined message's attachments wait for compliance review. */
      if (extract && result.record.status !== 'quarantined' && result.record.attachments.length) {
        for (const attachment of result.record.attachments) {
          toExtract.push({ inboxId: box.inboxId, messageId: result.record.messageId, attachment, supplierId: supplier ? supplier.id : null })
        }
      }
    }
  }

  saveStore(store)

  const extracted = []
  for (const job of toExtract.slice(0, 10)) {
    try {
      const outcome = await ingestAttachment(job)
      extracted.push({ filename: job.attachment.filename, ok: outcome.ok, readable: outcome.extracted, documentId: outcome.document && outcome.document.id, reason: outcome.reason })
    } catch (error) {
      extracted.push({ filename: job.attachment.filename, ok: false, reason: String(error.message).slice(0, 160) })
    }
  }

  const finalStore = loadStore()
  const finalMail = mailState(finalStore)
  finalMail.lastSyncAt = new Date().toISOString()
  finalMail.inbox = box.email
  saveStore(finalStore)

  return {
    ok: true,
    inbox: box.email,
    scanned: messages.length,
    newMessages,
    quarantined,
    extracted,
    documents: finalMail.documents.length,
    syncedAt: finalMail.lastSyncAt
  }
}

export function mailSummary() {
  const store = loadStore()
  const mail = mailState(store)
  return {
    inbox: mail.inbox || null,
    lastSyncAt: mail.lastSyncAt || null,
    messages: mail.messages.slice(0, 40),
    documents: mail.documents.slice(0, 40),
    events: mail.events.slice(0, 20),
    counts: {
      messages: mail.messages.length,
      quarantined: mail.messages.filter((entry) => entry.status === 'quarantined').length,
      documents: mail.documents.length,
      readableDocuments: mail.documents.filter((entry) => entry.readable).length
    }
  }
}

export function documentHash(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}
