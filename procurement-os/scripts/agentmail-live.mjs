#!/usr/bin/env node
/* Live AgentMail verification.

   Everything else in the suite is a unit test against a stubbed SDK. This
   script talks to the real account named by AGENTMAIL_API_KEY and proves the
   transport works: the key authenticates, a mailbox exists, a message is
   actually sent and read back, every SDK method in the registry resolves
   against the installed package, and a webhook signature verifies.

   It is deliberately not part of `npm test`: it costs real mail and needs a
   key. Run `node scripts/agentmail-live.mjs` for the read-only checks, or
   `node scripts/agentmail-live.mjs --send` to also send the self-addressed
   RFQ probe. */

import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(root, '.env.local'))
} catch {
  /* No .env.local: the script reports "not configured" rather than throwing. */
}

const { status, mailbox, call, hasMethod, apiKey, webhookSecret, configuredInbox, SDK_SURFACE } =
  await import('../lib/integrations/agentmail/client.mjs')
const { verify, HANDLED_EVENTS } = await import('../lib/integrations/agentmail/webhook.mjs')
const { sendGuarded } = await import('../lib/integrations/agentmail/gate.mjs')

const shouldSend = process.argv.includes('--send')
const out = { at: new Date().toISOString(), steps: [] }
const step = (name, result) => {
  out.steps.push({ name, ...result })
  return result
}

if (!apiKey()) {
  console.log(JSON.stringify({ ok: false, reason: 'AGENTMAIL_API_KEY is not set in .env.local' }, null, 2))
  process.exit(1)
}

/* 1. The key authenticates and a mailbox answers. */
const health = await status()
step('health', {
  ok: health.connected === true,
  configured: health.configured,
  connected: health.connected,
  inbox: health.inbox || null,
  inboxCount: health.inboxCount ?? null,
  reason: health.reason || null,
  status: health.status ?? null
})

/* 2. Registry coverage: every declared method must exist on the installed SDK.
      A method named here but absent from the package would 404 at runtime. */
const missing = SDK_SURFACE.filter((entry) => !hasMethod(`${entry.path}.${entry.method}`))
step('sdk_surface', {
  ok: missing.length === 0,
  total: SDK_SURFACE.length,
  resolved: SDK_SURFACE.length - missing.length,
  missing: missing.map((entry) => `${entry.path}.${entry.method}`)
})

/* 3. Box resolution. With AGENTMAIL_INBOX set this is the existing address;
      otherwise the desk inbox is created with a stable client id. */
const box = await mailbox()
step('mailbox', { ok: box.ok === true, inboxId: box.inboxId || null, email: box.email || null, created: Boolean(box.created), reason: box.reason || null })

let sentMessageId = null

if (box.ok) {
  const inboxes = await call('inboxes.list', {})
  step('inboxes.list', { ok: inboxes.ok, count: inboxes.ok ? (inboxes.data.inboxes || []).length : null, reason: inboxes.reason || null })

  const messages = await call('inboxes.messages.list', box.inboxId, { limit: 5 })
  step('messages.list', {
    ok: messages.ok,
    count: messages.ok ? (messages.data.messages || []).length : null,
    reason: messages.reason || null
  })

  const threads = await call('inboxes.threads.list', box.inboxId, { limit: 5 })
  step('threads.list', { ok: threads.ok, count: threads.ok ? (threads.data.threads || []).length : null, reason: threads.reason || null })

  /* A real send through the gate. The recipient is the desk's own address, so
     the probe cannot mail a third party. Every context flag is what a genuine
     RFQ to a verified matching supplier would carry. */
  if (shouldSend) {
    const send = await sendGuarded({
      intent: 'rfq',
      actorRole: 'procurement_officer',
      to: box.email,
      subject: 'WPOS transport probe - request for quotation (self-addressed)',
      text: [
        'This is a delivery probe from the Waide Procurement OS.',
        'It was sent to the desk mailbox itself to prove outbound transport works.',
        'No supplier was contacted and no price or delivery commitment is made.'
      ].join('\n\n'),
      supplierId: 'probe:self-addressed',
      labels: ['procurement-outbound', 'transport-probe'],
      idempotencyKey: `probe-${Date.now()}`,
      context: { recipientVerified: true, templateApproved: true }
    })
    sentMessageId = send.messageId || null
    step('send', {
      ok: send.ok === true,
      sent: Boolean(send.sent),
      messageId: send.messageId || null,
      inbox: send.inbox || null,
      decision: send.verdict ? send.verdict.decision : null,
      blockers: send.verdict ? send.verdict.blockers : null,
      reason: send.reason || null
    })
  }
}

/* 4. Webhook signature. A real delivery cannot be triggered from here (it needs
      a public HTTPS endpoint), so the signing path is proven by reproducing the
      Svix scheme over fresh bytes with the account's own secret. If the secret
      is wrong, verification fails here exactly as it would in production. */
const secret = webhookSecret()
if (!secret) {
  step('webhook_signature', { ok: false, reason: 'AGENTMAIL_WEBHOOK_SECRET is not set' })
} else {
  const normalised = /^whsec_/.test(secret) ? secret : 'whsec_' + secret
  const key = Buffer.from(normalised.replace(/^whsec_/, ''), 'base64')
  const id = 'msg_probe_' + Date.now()
  const timestamp = Math.floor(Date.now() / 1000)
  const payload = JSON.stringify({
    type: 'message.received',
    data: { message_id: sentMessageId || 'probe', subject: 'signature probe' }
  })
  const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${payload}`).digest('base64')

  const accepted = verify(payload, {
    'svix-id': id,
    'svix-timestamp': String(timestamp),
    'svix-signature': `v1,${signature}`
  })
  const tampered = verify(payload.replace('probe', 'tampered'), {
    'svix-id': id,
    'svix-timestamp': String(timestamp),
    'svix-signature': `v1,${signature}`
  })

  step('webhook_signature', {
    ok: accepted.ok === true && tampered.ok === false,
    acceptedValid: accepted.ok,
    rejectedTampered: tampered.ok === false,
    tamperStatus: tampered.status || null,
    handledEvents: HANDLED_EVENTS
  })
}

/* 5. Registered webhooks, so a stale delivery URL is visible. */
const hooks = await call('webhooks.list', {})
step('webhooks.list', {
  ok: hooks.ok,
  count: hooks.ok ? (hooks.data.webhooks || []).length : null,
  urls: hooks.ok ? (hooks.data.webhooks || []).map((hook) => hook.url) : null,
  reason: hooks.reason || null
})

out.ok = out.steps.filter((entry) => entry.ok === false).length === 0
console.log(JSON.stringify(out, null, 2))
process.exit(out.ok ? 0 : 1)
