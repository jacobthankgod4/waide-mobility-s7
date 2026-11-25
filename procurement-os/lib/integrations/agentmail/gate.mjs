/* Outbound gate.

   Every outbound AgentMail call passes two independent checks before a byte
   leaves the desk:

     1. authority - policy.authorize() decides whether this actor may issue
        this class of message at all, and refuses for AI on anything that
        carries a signature or a commitment;
     2. content policy - comms.evaluateOutbound() decides whether this specific
        message is sendable (verified recipient, business link, sourced claims,
        approved attachments, no commitment language in an autonomous class).

   Only when both return a sendable decision does the SDK get called. A refusal
   is recorded in the ledger with the reasons, so "the system would not send it"
   is auditable after the fact. */

import { authorize } from '../../engines/policy.mjs'
import { evaluateOutbound, AUTOMATED_SIGNATURE } from '../../engines/comms.mjs'
import { record } from '../../data/store.mjs'
import { call, mailbox, isConfigured } from './client.mjs'

/* Intent -> capability. An intent with no capability is refused: a new message
   class must be delegated explicitly, never inherited by default. */
export const INTENT_CAPABILITY = {
  rfq: 'supplier.rfq',
  supplier_capability_enquiry: 'supplier.rfq',
  technical_document_request: 'supplier.rfq',
  manufacturer_authorisation_request: 'supplier.rfq',
  supplier_followup: 'supplier.followup',
  acknowledgement: 'supplier.followup',
  delivery_status_request: 'supplier.followup',
  meeting_scheduling: 'supplier.followup',
  delivery_status_update: 'supplier.followup',
  buyer_clarification: 'supplier.followup',
  buyer_factual_response: 'supplier.followup',
  final_quotation: 'bid.price.final',
  bid_submission: 'bid.submit',
  technical_equivalence: 'bid.technical.equivalence',
  contract_acceptance: 'contract.accept',
  price_or_delivery_change: 'contract.variation',
  variation_or_waiver: 'contract.variation',
  claim_or_dispute: 'contract.variation',
  eligibility_statement: 'contract.sign',
  financial_commitment: 'guarantee.issue'
}

function ledger(event) {
  try {
    record(event)
  } catch (error) {
    /* The ledger is the record of truth; if it cannot be written the send must
       not proceed. The caller sees the failure. */
    throw new Error('ledger_unavailable: ' + error.message)
  }
}

/* Decide, without sending. Used by the compose screen to show the verdict
   before a person presses send. */
export function review({ intent, actorRole = 'ai_agent', body, to, opportunityId, supplierId, contractId, claims, attachments, idempotencyKey, context = {} }) {
  const capability = INTENT_CAPABILITY[intent]
  if (!capability) {
    return {
      decision: 'blocked',
      authority: { allowed: false, reason: 'No delegated capability for intent "' + intent + '".' },
      policy: null,
      blockers: ['Intent "' + intent + '" is not delegated to any capability - fail closed.'],
      signature: AUTOMATED_SIGNATURE
    }
  }

  const authority = authorize(capability, actorRole, { amount: context.amount || 0 })
  const policy = evaluateOutbound(
    { intent, body, opportunityId, supplierId, contractId, claims, attachments, idempotencyKey },
    {
      recipientVerified: Boolean(context.recipientVerified),
      templateApproved: Boolean(context.templateApproved),
      recipientClearedForFinancial: Boolean(context.recipientClearedForFinancial),
      idempotencyKeyUsed: Boolean(context.idempotencyKeyUsed)
    }
  )

  const blockers = [...(policy.blockers || [])]
  if (!authority.allowed) blockers.unshift(authority.reason || 'Authority refused.')

  let decision = 'send'
  if (blockers.length) decision = 'blocked'
  else if (policy.decision === 'human_approval' || authority.mode === 'human' || authority.mode === 'dual') decision = 'requires_human_approval'
  else if (authority.mode === 'prepared') decision = 'prepare_only'

  return { decision, authority, policy, blockers, capability, signature: AUTOMATED_SIGNATURE }
}

/* Send through AgentMail after the gate. Never sends when the gate refuses. */
export async function sendGuarded({
  intent,
  actorRole = 'ai_agent',
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  labels = [],
  headers,
  attachments,
  opportunityId,
  supplierId,
  contractId,
  claims = [],
  idempotencyKey,
  context = {},
  approvedBy = null
}) {
  if (!isConfigured()) {
    return { ok: false, sent: false, configured: false, reason: 'AGENTMAIL_API_KEY is not set; nothing was sent.' }
  }

  const verdict = review({
    intent, actorRole, body: text, to, opportunityId, supplierId, contractId,
    claims, attachments: attachments || [], idempotencyKey, context
  })

  if (verdict.decision === 'blocked') {
    ledger({
      type: 'agentmail.send.blocked',
      intent,
      to,
      capability: verdict.capability,
      blockers: verdict.blockers,
      at: new Date().toISOString()
    })
    return { ok: false, sent: false, blocked: true, decision: verdict.decision, verdict }
  }

  if (verdict.decision === 'requires_human_approval' && !approvedBy) {
    return {
      ok: false,
      sent: false,
      requiresApproval: true,
      decision: verdict.decision,
      reason: 'This message class needs a named human approver; it was not sent.',
      verdict
    }
  }

  const box = await mailbox()
  if (!box.ok) return { ok: false, sent: false, reason: box.reason, verdict }

  const body = String(text || '')
  const signed = /Waide Procurement Operations/i.test(body)
    ? body
    : body.trimEnd() + '\n\n--\n' + AUTOMATED_SIGNATURE + '\n'

  const payload = {
    to: Array.isArray(to) ? to : [to],
    subject,
    text: signed,
    labels: labels.length ? labels : ['procurement-outbound']
  }
  if (html) payload.html = html
  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc]
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc]
  if (headers) payload.headers = headers
  if (attachments && attachments.length) {
    payload.attachments = attachments.map((attachment) => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      content: attachment.content
    }))
  }

  const sent = await call('inboxes.messages.send', box.inboxId, payload)

  ledger({
    type: sent.ok ? 'agentmail.send.sent' : 'agentmail.send.failed',
    intent,
    capability: verdict.capability,
    actorRole,
    approvedBy,
    to: payload.to,
    subject,
    inbox: box.email,
    messageId: sent.ok ? (sent.data && sent.data.messageId) : null,
    reason: sent.ok ? null : sent.reason,
    at: new Date().toISOString()
  })

  return sent.ok
    ? { ok: true, sent: true, messageId: sent.data && sent.data.messageId, inbox: box.email, verdict }
    : { ok: false, sent: false, reason: sent.reason, status: sent.status, verdict }
}

/* Stage a message as a draft. Used for every class that needs a human: the
   draft exists in the mailbox, a person reviews and sends it. */
export async function draftGuarded({ intent, actorRole = 'ai_agent', to, subject, text, html, opportunityId, supplierId, contractId, claims, idempotencyKey, context = {} }) {
  const verdict = review({ intent, actorRole, body: text, to, opportunityId, supplierId, contractId, claims, attachments: [], idempotencyKey, context })
  if (verdict.decision === 'blocked') {
    return { ok: false, drafted: false, decision: verdict.decision, verdict }
  }

  const box = await mailbox()
  if (!box.ok) return { ok: false, drafted: false, reason: box.reason }

  const payload = {
    to: Array.isArray(to) ? to : [to],
    subject,
    text: String(text || '').trimEnd() + '\n\n--\n' + AUTOMATED_SIGNATURE + '\n'
  }
  if (html) payload.html = html

  const created = await call('inboxes.drafts.create', box.inboxId, payload)
  ledger({
    type: created.ok ? 'agentmail.draft.created' : 'agentmail.draft.failed',
    intent,
    to: payload.to,
    subject,
    inbox: box.email,
    draftId: created.ok ? (created.data && created.data.draftId) : null,
    reason: created.ok ? null : created.reason,
    at: new Date().toISOString()
  })

  return created.ok
    ? { ok: true, drafted: true, draftId: created.data && created.data.draftId, verdict }
    : { ok: false, drafted: false, reason: created.reason, verdict }
}

/* Reply on an existing thread. Same gate, plus the inbound thread must be the
   one being answered so a reply cannot be attached to the wrong supplier. */
export async function replyGuarded({ inboxId, messageId, intent = 'supplier_followup', actorRole = 'ai_agent', text, html, opportunityId, supplierId, claims = [], idempotencyKey, context = {} }) {
  const verdict = review({ intent, actorRole, body: text, to: 'thread', opportunityId, supplierId, claims, attachments: [], idempotencyKey, context })
  if (verdict.decision === 'blocked' || verdict.decision === 'requires_human_approval') {
    return { ok: false, replied: false, decision: verdict.decision, verdict }
  }

  const payload = {
    text: String(text || '').trimEnd() + '\n\n--\n' + AUTOMATED_SIGNATURE + '\n'
  }
  if (html) payload.html = html

  const reply = await call('inboxes.messages.reply', inboxId, messageId, payload)
  ledger({
    type: reply.ok ? 'agentmail.reply.sent' : 'agentmail.reply.failed',
    intent,
    inbox: inboxId,
    messageId,
    reason: reply.ok ? null : reply.reason,
    at: new Date().toISOString()
  })
  return { ok: reply.ok, replied: reply.ok, messageId: reply.ok ? reply.data && reply.data.messageId : null, reason: reply.reason }
}
