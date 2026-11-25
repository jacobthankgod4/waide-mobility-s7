/* Temporal activities.

   Activities are the only place a workflow touches the world. Each one calls
   the deterministic engine the console already uses and persists through the
   same store, so a Temporal run and a button press cannot disagree.

   Nothing here accepts an outcome from its caller: `recordBidApproval` re-runs
   the gate with the approver's role, and `applyApprovalDecision` re-reads the
   stored approval before applying the rule. A workflow that has been tampered
   with, or replayed, still cannot approve something the engine refuses. */

import { loadStore, saveStore, record } from '../data/store.mjs'
import { applyDecision } from '../engines/approvals.mjs'
import { evaluateBidApproval as checkBidApproval, evaluateBidSubmission } from '../engines/bidSubmission.mjs'
import { transition } from '../engines/workflow.mjs'
import { buildOpportunityView } from '../view.mjs'

function audit(entry) {
  try {
    record({ at: new Date().toISOString(), actorType: 'system', ...entry })
  } catch (error) {
    /* The caller must know the audit trail is broken; a workflow that proceeds
       without a ledger entry is worse than one that retries. */
    throw new Error('ledger_unavailable: ' + error.message)
  }
}

export async function loadApproval({ approvalId }) {
  const store = loadStore()
  const approval = (store.approvals || []).find((item) => item.id === approvalId)
  if (!approval) return { found: false, approvalId }
  return {
    found: true,
    approvalId,
    status: approval.status,
    requiredRoles: approval.requiredRoles || [],
    decisions: approval.decisions || [],
    action: approval.action,
    subjectId: approval.subjectId
  }
}

export async function applyApprovalDecision({ approvalId, role, name, decision, rationale }) {
  const store = loadStore()
  const approval = (store.approvals || []).find((item) => item.id === approvalId)
  if (!approval) throw new Error(`Approval ${approvalId} not found`)

  const result = applyDecision(approval, { role, name, decision, rationale })

  if (!result.ok) {
    audit({
      actor: name || role,
      action: 'approval.decision.refused',
      subject: approvalId,
      policyDecision: result.reason,
      result: result.reason
    })
    return { ok: false, approvalId, status: result.status, reason: result.reason, decisions: result.decisions }
  }

  approval.status = result.status
  approval.decisions = result.decisions
  approval.decidedBy = result.decidedBy ?? approval.decidedBy
  approval.decidedAt = result.decidedAt ?? approval.decidedAt
  saveStore(store)

  audit({
    actor: name || role,
    actorType: 'human',
    action: 'approval.decision',
    subject: approvalId,
    policyDecision: `${role} decided ${decision || 'approve'}; status ${result.status}`,
    result: result.reason
  })

  return {
    ok: true,
    approvalId,
    status: result.status,
    decisions: result.decisions,
    secondApproverRole: result.secondApproverRole ?? null,
    reason: result.reason
  }
}

async function gateFor(store, opportunity, actorRole) {
  const view = buildOpportunityView(store, opportunity, new Date(), { role: actorRole })
  return checkBidApproval({
    opportunity,
    gate: view.gate,
    margin: view.margin,
    cash: view.cash,
    deadline: view.deadline,
    actorRole,
    marginException: view.marginException
  })
}

/* Readiness only: is this bid in a state a signatory could approve? The role
   here represents the prospective signatory, because the authority check is
   repeated for real in recordBidApproval once a named person signs. */
export async function evaluateBidApproval({ opportunityId, actorRole = 'managing_director' }) {
  const store = loadStore()
  const opportunity = (store.opportunities || []).find((item) => item.id === opportunityId)
  if (!opportunity) return { allowed: false, blockers: ['Opportunity not found.'], warnings: [] }

  const result = await gateFor(store, opportunity, actorRole)
  return {
    allowed: result.allowed,
    blockers: result.blockers,
    warnings: result.warnings,
    stage: opportunity.stage,
    reason: result.reason
  }
}

export async function recordBidApproval({ opportunityId, approverRole, approverName }) {
  const store = loadStore()
  const opportunity = (store.opportunities || []).find((item) => item.id === opportunityId)
  if (!opportunity) return { ok: false, blockers: ['Opportunity not found.'] }

  /* Re-checked with the approver's own role: the engine refuses anyone not
     delegated `bid.submit`, so an AI actor cannot approve by naming itself. */
  const result = await gateFor(store, opportunity, approverRole)
  if (!result.allowed) {
    audit({
      actor: approverName || approverRole,
      action: 'bid.approval.blocked',
      subject: opportunityId,
      policyDecision: result.blockers.join(' '),
      result: 'Bid approval refused.'
    })
    return { ok: false, blockers: result.blockers }
  }

  const step = transition('opportunity', opportunity.stage, 'bid_approved')
  if (!step.ok) return { ok: false, blockers: [step.reason] }

  opportunity.stage = 'bid_approved'
  opportunity.bidApprovedAt = new Date().toISOString()
  opportunity.bidApprovedBy = approverName || approverRole
  saveStore(store)

  audit({
    actor: approverName || approverRole,
    actorType: 'human',
    action: 'bid.approved',
    subject: opportunityId,
    policyDecision: result.reason,
    result: 'Opportunity moved to bid_approved.'
  })

  return { ok: true, stage: opportunity.stage }
}

export async function recordBidSubmission({ opportunityId, receipt, actorRole }) {
  const store = loadStore()
  const opportunity = (store.opportunities || []).find((item) => item.id === opportunityId)
  if (!opportunity) return { ok: false, blockers: ['Opportunity not found.'] }

  const result = evaluateBidSubmission({ opportunity, receipt, actorRole })
  if (!result.allowed) {
    audit({
      actor: actorRole,
      action: 'bid.submission.blocked',
      subject: opportunityId,
      policyDecision: result.blockers.join(' '),
      result: 'Bid submission refused.'
    })
    return { ok: false, blockers: result.blockers }
  }

  const step = transition('opportunity', opportunity.stage, 'submitted')
  if (!step.ok) return { ok: false, blockers: [step.reason] }

  opportunity.stage = 'submitted'
  opportunity.submission = receipt
  opportunity.submittedAt = receipt.capturedAt || new Date().toISOString()
  opportunity.submittedBy = actorRole
  saveStore(store)

  audit({
    actor: actorRole,
    actorType: 'human',
    action: 'bid.submitted',
    subject: opportunityId,
    policyDecision: result.reason,
    result: `Portal receipt ${receipt.officialReference} recorded.`
  })

  return { ok: true, stage: opportunity.stage }
}
