/* Waide Mobility - AgentMail webhook.

   POST /api/agent-mail-webhook

   AgentMail delivers message events here, signed with Svix. The raw body is
   verified against AGENTMAIL_WEBHOOK_SECRET before the payload is trusted, a
   message.received is answered from the same inbox, and any other event is
   acknowledged and ignored. Register this URL for message.received in the
   AgentMail console and put the webhook's signing secret in the environment.

   Deliveries are at least once and retried on a 5xx, so answering checks the
   replied label before a second reply goes out.
*/

'use strict'

var agentMail = require('./_agentmail')

/* Vercel parses application/json into req.body and restores the stream; a
   signature is only valid over the exact bytes that were sent, so read them
   wherever they are still available. */
async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') return req.body

  var chunks = []
  try {
    for await (var chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
  } catch (error) {
    /* The runtime consumed the stream when it parsed the body. */
  }

  if (chunks.length) return Buffer.concat(chunks)
  if (req.body && typeof req.body === 'object') return Buffer.from(JSON.stringify(req.body))
  return Buffer.from('')
}

function signingSecret(value) {
  return /^whsec_/.test(value) ? value : 'whsec_' + value
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' })
    return
  }

  var secret = agentMail.webhookSecret()
  if (!secret) {
    res.status(503).json({ ok: false, error: 'not_configured' })
    return
  }

  var payload = await rawBody(req)

  var event
  try {
    var Webhook = require('svix').Webhook
    event = new Webhook(signingSecret(secret)).verify(payload, req.headers)
  } catch (error) {
    res.status(401).json({ ok: false, error: 'invalid_signature' })
    return
  }

  if (!event || event.event_type !== 'message.received') {
    res.status(200).json({
      ok: true,
      handled: false,
      event: (event && event.event_type) || 'unknown'
    })
    return
  }

  try {
    var result = await agentMail.handleIncomingMessage(event.message)
    res.status(200).json({
      ok: true,
      handled: Boolean(result.replied),
      reason: result.reason || 'replied'
    })
  } catch (error) {
    /* A 502 asks AgentMail to retry; repeating is safe because the replied
       label is checked before another answer is sent. */
    res.status(502).json({ ok: false, error: 'reply_failed' })
  }
}