/* Waide Mobility - enquiry endpoint (Vercel serverless function).
   POST /api/enquiry

   The site is static. This function is the only place an enquiry is handled:
   it validates the submission, stores a record and sends a notification
   email. The visitor gets a reference number back, so an enquiry survives a
   machine with no desktop mail client.

   Environment variables (all optional, but at least one delivery route must
   be configured or the endpoint answers 503 and the browser falls back to
   the documented email address):
     BREVO_API_KEY                Brevo API key (xkeysib-...), preferred route
     SUPABASE_URL                 e.g. https://xxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY    service role key, server side only
     RESEND_API_KEY               Resend API key, used only if Brevo is absent
     ENQUIRY_TO                   inbox that receives notifications
     ENQUIRY_FROM                 verified sender, e.g. Stephanie Ezedunukwe <sales@waidemobility.com>

   Brevo is called over HTTPS, not port 587: serverless functions cannot hold
   an SMTP socket open, and the Brevo REST API uses the same account and key.
   The sender address must be verified in Brevo (Senders, Domains & IPs).
*/

'use strict'

var CATEGORIES = {
  general: 'General enquiry',
  supplies: 'Medical supplies quotation',
  'supplies-tender': 'Supplies tender or prequalification',
  mapping: 'Indoor mapping project',
  'mapping-tender': 'Indoor mapping tender',
  consultancy: 'Consultancy project',
  procurement: 'Procurement or tender',
  partnership: 'Technical partnership',
  platform: 'Product and platform'
}

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function makeReference() {
  var now = new Date()
  var date = String(now.getUTCFullYear()).slice(2) +
    ('0' + (now.getUTCMonth() + 1)).slice(-2) +
    ('0' + now.getUTCDate()).slice(-2)
  var tail = Math.random().toString(36).slice(2, 6).toUpperCase()
  return 'WM-' + date + '-' + tail
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

async function store(record) {
  var url = process.env.SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { configured: false, ok: false }

  var response = await fetch(url.replace(/\/+$/, '') + '/rest/v1/enquiries', {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(record)
  })

  return { configured: true, ok: response.ok }
}

function parseSender(value, fallback) {
  var match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(String(value || ''))
  if (match) return { name: match[1] || 'Stephanie Ezedunukwe', email: match[2].trim() }
  var email = String(value || fallback || '').trim()
  return { name: process.env.ENQUIRY_SENDER_NAME || 'Stephanie Ezedunukwe', email: email }
}

/* Brevo transactional email over HTTPS. This is the configured route for the
   contact form: every enquiry is delivered to the sales inbox with the
   visitor's address as reply-to, so a reply goes straight back to them. */
async function notifyBrevo(record) {
  var key = process.env.BREVO_API_KEY
  if (!key) return { configured: false, ok: false }

  var to = process.env.ENQUIRY_TO || 'sales@waidemobility.com'
  var sender = parseSender(process.env.ENQUIRY_FROM || to, to)

  var rows = [
    ['Reference', record.reference],
    ['Name', record.name],
    ['Organisation', record.organisation || 'not given'],
    ['Email', record.email],
    ['Enquiry type', CATEGORIES[record.category] || record.category],
    ['Subject', record.subject],
    ['Page', record.source_page || 'not given']
  ]

  var html = '<h2>Website enquiry ' + escapeHtml(record.reference) + '</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse;font:14px system-ui">' +
    rows.map(function (row) {
      return '<tr><th align="left" style="background:#f3f4f6">' + escapeHtml(row[0]) +
        '</th><td>' + escapeHtml(row[1]) + '</td></tr>'
    }).join('') +
    '</table><h3>Message</h3><pre style="white-space:pre-wrap;font:14px system-ui">' +
    escapeHtml(record.message) + '</pre>'

  var text = 'Website enquiry ' + record.reference + '\n\n' +
    rows.map(function (row) { return row[0] + ': ' + row[1] }).join('\n') +
    '\n\nMessage\n' + record.message + '\n'

  var response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': key,
      accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: sender,
      to: [{ email: to }],
      replyTo: { email: record.email, name: record.name },
      subject: '[' + record.reference + '] ' + record.subject,
      htmlContent: html,
      textContent: text
    })
  })

  return { configured: true, ok: response.ok, provider: 'brevo' }
}

async function notifyResend(record) {
  var key = process.env.RESEND_API_KEY
  if (!key) return { configured: false, ok: false }

  var to = process.env.ENQUIRY_TO || 'sales@waidemobility.com'
  var from = process.env.ENQUIRY_FROM || 'Waide Mobility <onboarding@resend.dev>'

  var rows = [
    ['Reference', record.reference],
    ['Name', record.name],
    ['Organisation', record.organisation || 'not given'],
    ['Email', record.email],
    ['Enquiry type', CATEGORIES[record.category] || record.category],
    ['Subject', record.subject],
    ['Page', record.source_page || 'not given']
  ]

  var html = '<h2>Website enquiry ' + escapeHtml(record.reference) + '</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse;font:14px system-ui">' +
    rows.map(function (row) {
      return '<tr><th align="left" style="background:#f3f4f6">' + escapeHtml(row[0]) +
        '</th><td>' + escapeHtml(row[1]) + '</td></tr>'
    }).join('') +
    '</table><h3>Message</h3><pre style="white-space:pre-wrap;font:14px system-ui">' +
    escapeHtml(record.message) + '</pre>'

  var response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      reply_to: record.email,
      subject: '[' + record.reference + '] ' + record.subject,
      html: html
    })
  })

  return { configured: true, ok: response.ok, provider: 'resend' }
}

/* Brevo first; Resend only when no Brevo key is set. */
async function notify(record) {
  var brevo = await notifyBrevo(record)
  if (brevo.configured) return brevo
  return notifyResend(record)
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

  var body = parseBody(req)

  /* Honeypot: a person never fills a field they cannot see. */
  if (text(body.website, 200)) {
    res.status(200).json({ ok: true, reference: makeReference() })
    return
  }

  if (rateLimited(clientIp(req))) {
    res.status(429).json({ ok: false, error: 'rate_limited' })
    return
  }

  var record = {
    name: text(body.name, 120),
    organisation: text(body.organisation, 160),
    email: text(body.email, 200).toLowerCase(),
    category: text(body.category, 40),
    subject: text(body.subject, 200),
    message: text(body.message, 6000),
    source_page: text(body.source_page, 300)
  }

  var problems = []
  if (record.name.length < 2) problems.push('name')
  if (!validEmail(record.email)) problems.push('email')
  if (!CATEGORIES[record.category]) problems.push('category')
  if (record.subject.length < 3) problems.push('subject')
  if (record.message.length < 10) problems.push('message')
  if (body.consent !== true) problems.push('consent')

  if (problems.length) {
    res.status(422).json({ ok: false, error: 'invalid_fields', fields: problems })
    return
  }

  record.reference = makeReference()
  record.status = 'new'
  record.user_agent = text(req.headers['user-agent'], 300)

  var stored
  var sent
  try {
    stored = await store(record)
    sent = await notify(record)
  } catch (error) {
    res.status(502).json({ ok: false, error: 'delivery_failed' })
    return
  }

  if (!stored.configured && !sent.configured) {
    res.status(503).json({ ok: false, error: 'not_configured' })
    return
  }

  if (!stored.ok && !sent.ok) {
    res.status(502).json({ ok: false, error: 'delivery_failed' })
    return
  }

  res.status(200).json({
    ok: true,
    reference: record.reference,
    stored: Boolean(stored.ok),
    notified: Boolean(sent.ok)
  })
}
