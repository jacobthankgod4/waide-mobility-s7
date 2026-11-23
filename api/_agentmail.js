/* Waide Mobility - AgentMail inbox for the enquiry agent.

   Shared by api/enquiry.js (acknowledgement after a stored enquiry) and
   api/agent-mail-webhook.js (signed replies to the agent address). Vercel does
   not deploy files whose name starts with "_" as endpoints, so this module has
   no public URL of its own.

   Environment (values only, never in code):
     AGENTMAIL_API_KEY         API key from console.agentmail.to
     AGENTMAIL_WEBHOOK_SECRET  Svix signing secret of the webhook endpoint
*/

'use strict'

/* A stable client id makes inbox creation idempotent: creating it again
   returns the same address instead of a new inbox, so a cold start or a
   retried request never leaves orphaned inboxes behind. */
var INBOX_CLIENT_ID = 'waide-mobility-enquiry-agent-v1'
var INBOX_DISPLAY_NAME = 'Waide Mobility Enquiry Agent'
var REPLY_LABEL = 'replied'

var cachedClient = null
var cachedInbox = null

function apiKey() {
  return process.env.AGENTMAIL_API_KEY || ''
}

function webhookSecret() {
  return process.env.AGENTMAIL_WEBHOOK_SECRET || ''
}

function mailClient() {
  if (!apiKey()) return null
  if (!cachedClient) {
    var AgentMailClient = require('agentmail').AgentMailClient
    cachedClient = new AgentMailClient({ apiKey: apiKey() })
  }
  return cachedClient
}

async function agentInbox(mail) {
  if (!cachedInbox) {
    cachedInbox = await mail.inboxes.create({
      clientId: INBOX_CLIENT_ID,
      displayName: INBOX_DISPLAY_NAME
    })
  }
  return cachedInbox
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function acknowledgement(enquiry) {
  var name = enquiry.name || 'there'
  var reference = enquiry.reference || 'on request'
  var subject = enquiry.subject || 'your message'

  var text = 'Hello ' + name + ',\n\n' +
    'Thank you for contacting Waide Mobility. Your enquiry is with the team ' +
    'and carries reference ' + reference + '.\n\n' +
    '  Subject: ' + subject + '\n\n' +
    'A person will reply within one working day. Reply to this email to add ' +
    'documents, dates or questions; the reference stays with the conversation.\n\n' +
    'Waide Mobility\nsales@waidemobility.com\n'

  var html = '<p>Hello ' + escapeHtml(name) + ',</p>' +
    '<p>Thank you for contacting Waide Mobility. Your enquiry is with the team ' +
    'and carries reference <strong>' + escapeHtml(reference) + '</strong>.</p>' +
    '<table cellpadding="6" style="border-collapse:collapse;font:14px system-ui">' +
    '<tr><th align="left" style="background:#f3f4f6">Subject</th><td>' + escapeHtml(subject) + '</td></tr>' +
    '</table>' +
    '<p>A person will reply within one working day. Reply to this email to add ' +
    'documents, dates or questions; the reference stays with the conversation.</p>' +
    '<p>Waide Mobility<br><a href="mailto:sales@waidemobility.com">sales@waidemobility.com</a></p>'

  return { text: text, html: html }
}

function replyBody(message) {
  var subject = message && message.subject ? ' about "' + message.subject + '"' : ''

  var text = 'Hello,\n\n' +
    'Thank you for your reply' + subject + '. It has reached the Waide Mobility ' +
    'team and a person will come back to you within one working day. Reply to ' +
    'this email and it stays on the same thread.\n\n' +
    'Waide Mobility\nsales@waidemobility.com\n'

  var html = '<p>Hello,</p>' +
    '<p>Thank you for your reply' + escapeHtml(subject) + '. It has reached the ' +
    'Waide Mobility team and a person will come back to you within one working ' +
    'day. Reply to this email and it stays on the same thread.</p>' +
    '<p>Waide Mobility<br><a href="mailto:sales@waidemobility.com">sales@waidemobility.com</a></p>'

  return { text: text, html: html }
}

/* Send the reference back to the visitor from the agent inbox. The caller
   keeps this best effort: an AgentMail outage must not fail the enquiry. */
async function acknowledgeEnquiry(enquiry) {
  var to = enquiry && (enquiry.to || enquiry.email)
  if (!to) return { configured: Boolean(apiKey()), ok: false, reason: 'no_recipient' }

  var mail = mailClient()
  if (!mail) return { configured: false, ok: false }

  var inbox = await agentInbox(mail)
  var body = acknowledgement(enquiry)
  var message = await mail.inboxes.messages.send(inbox.inboxId, {
    to: [to],
    subject: 'We have your Waide Mobility enquiry (' + (enquiry.reference || 'on request') + ')',
    text: body.text,
    html: body.html
  })

  return {
    configured: true,
    ok: true,
    inbox: inbox.email,
    messageId: message.messageId
  }
}

function addressList(value) {
  if (!value) return []
  var list = Array.isArray(value) ? value : [value]
  return list.map(function (item) {
    if (item && typeof item === 'object') return String(item.email || item.address || '')
    return String(item || '')
  }).filter(Boolean)
}

function isOwnMessage(message, inboxId) {
  var own = String(inboxId).toLowerCase()
  return addressList(message.from_ || message.from).some(function (address) {
    return address.toLowerCase() === own
  })
}

function alreadyAnswered(message) {
  var labels = message.labels || []
  return labels.indexOf(REPLY_LABEL) !== -1
}

function isAutoReply(message) {
  var headers = message.headers || {}
  var submitted = headers['auto-submitted'] || headers['Auto-Submitted']
  if (submitted && String(submitted).toLowerCase() !== 'no') return true

  var subject = String(message.subject || '').toLowerCase()
  return /^(automatic reply|auto[- ]?reply|out of office)\b/.test(subject)
}

/* Act on an inbound message from the webhook: answer it from the same inbox
   and mark it, so a redelivery cannot answer the same email twice. */
async function handleIncomingMessage(message) {
  if (!message) return { replied: false, reason: 'no_message' }

  var inboxId = message.inbox_id || message.inboxId
  var messageId = message.message_id || message.messageId
  if (!inboxId || !messageId) return { replied: false, reason: 'no_message' }
  if (isOwnMessage(message, inboxId)) return { replied: false, reason: 'own_message' }
  if (alreadyAnswered(message)) return { replied: false, reason: 'already_answered' }
  if (isAutoReply(message)) return { replied: false, reason: 'auto_reply' }

  var mail = mailClient()
  if (!mail) return { replied: false, reason: 'not_configured' }

  await mail.inboxes.messages.reply(inboxId, messageId, replyBody(message))

  try {
    await mail.inboxes.messages.update(inboxId, messageId, { addLabels: [REPLY_LABEL] })
  } catch (error) {
    /* The reply has already been sent; the label only guards against repeats. */
  }

  return { replied: true, inbox: inboxId, message_id: messageId }
}

module.exports = {
  webhookSecret: webhookSecret,
  acknowledgeEnquiry: acknowledgeEnquiry,
  handleIncomingMessage: handleIncomingMessage
}