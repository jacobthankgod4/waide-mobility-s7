/* Waide Mobility - AgentMail send endpoint (Vercel serverless function).
   POST /api/agent-mail

   Sends the enquiry acknowledgement from the AgentMail inbox the agent owns,
   so the visitor receives the reference in an email they can reply to. Replies
   arrive at /api/agent-mail-webhook, where the signature is checked.

   The enquiry itself is already stored and notified by /api/enquiry; this is
   the agent's own answer and stays best effort.

   Environment:
     AGENTMAIL_API_KEY   API key from console.agentmail.to
*/

'use strict'

var agentMail = require('./_agentmail')

var WINDOW_MS = 10 * 60 * 1000
var MAX_PER_WINDOW = 5
var hits = new Map()

function rateLimited(key) {
  var now = Date.now()
  var recent = hits.get(key) || []
  recent = recent.filter(function (time) { return now - time < WINDOW_MS })
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

function text(value, max) {
  return String(value == null ? '' : value)
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, max)
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body) } catch (error) { return {} }
  }
  return {}
}

function clientIp(req) {
  var forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim()
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown'
}

function sameOrigin(req) {
  var origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch (error) {
    return false
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' })
    return
  }

  if (!sameOrigin(req)) {
    res.status(403).json({ ok: false, error: 'forbidden_origin' })
    return
  }

  if (rateLimited(clientIp(req))) {
    res.status(429).json({ ok: false, error: 'rate_limited' })
    return
  }

  var body = parseBody(req)
  var acknowledgement = {
    to: text(body.email, 200).toLowerCase(),
    name: text(body.name, 120),
    reference: text(body.reference, 40),
    subject: text(body.subject, 200)
  }

  /* A reference is only issued by /api/enquiry, so requiring its shape keeps
     the endpoint from being used as a general-purpose mail sender. */
  var problems = []
  if (!validEmail(acknowledgement.to)) problems.push('email')
  if (!/^WM-\d{6}-[A-Z0-9]{4}$/.test(acknowledgement.reference)) problems.push('reference')

  if (problems.length) {
    res.status(422).json({ ok: false, error: 'invalid_fields', fields: problems })
    return
  }

  var result
  try {
    result = await agentMail.acknowledgeEnquiry(acknowledgement)
  } catch (error) {
    res.status(502).json({ ok: false, error: 'delivery_failed' })
    return
  }

  /* The acknowledgement is an optional extra on top of /api/enquiry. When
     AgentMail is not set up there is nothing to send, so this answers quietly
     instead of logging a failed request in the visitor's browser. */
  if (!result.configured) {
    res.status(200).json({ ok: false, configured: false })
    return
  }

  if (!result.ok) {
    res.status(502).json({ ok: false, error: 'delivery_failed' })
    return
  }

  res.status(200).json({
    ok: true,
    reference: acknowledgement.reference,
    inbox: result.inbox
  })
}