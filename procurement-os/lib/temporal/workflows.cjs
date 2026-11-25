'use strict'

/* Temporal workflows.

   A workflow outlives a page request: a dual-control approval can wait days for
   the second signature, and a bid approval can wait for a portal receipt. These
   functions therefore hold *no* decision logic. They orchestrate, and every
   decision is made by an activity calling the same deterministic engine the
   console uses (`applyDecision`, `evaluateBidApproval`, `evaluateBidSubmission`).

   That split is the point: a workflow cannot grant authority, and replaying a
   workflow cannot produce a different verdict than the engine recorded. */

const { proxyActivities, defineSignal, setHandler, condition, ApplicationFailure } = require('@temporalio/workflow')

const activities = proxyActivities({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 3, backoffCoefficient: 2 }
})

const DECISION = defineSignal('decision')
const WITHDRAW = defineSignal('withdraw')
const BID_APPROVAL = defineSignal('bid_approval')
const BID_RECEIPT = defineSignal('bid_receipt')

const HOUR = 60 * 60 * 1000

/* Dual-control approval: one mailbox per required authority, and the workflow
   ends on whichever comes first - the last required signature, a rejection, or
   the expiry of the decision window. A timeout is not an approval. */
async function approvalWorkflow(input) {
  const approvalId = input && input.approvalId
  if (!approvalId) throw ApplicationFailure.nonRetryable('approvalWorkflow needs an approvalId')

  const opened = await activities.loadApproval({ approvalId })
  if (!opened.found) throw ApplicationFailure.nonRetryable(`Approval ${approvalId} not found`)
  if (!['pending', 'awaiting_second'].includes(opened.status)) {
    return { approvalId, status: opened.status, closed: true, decisions: opened.decisions }
  }

  const queue = []
  let withdrawn = null
  setHandler(DECISION, (decision) => queue.push(decision))
  setHandler(WITHDRAW, (reason) => (withdrawn = reason || { by: 'unknown' }))

  const deadline = Date.now() + (input.windowMs || 7 * 24 * HOUR)
  let state = opened

  while (Date.now() < deadline) {
    if (withdrawn) {
      return { approvalId, status: 'withdrawn', withdrawnBy: withdrawn.by, decisions: state.decisions }
    }

    if (queue.length) {
      const next = queue.shift()
      /* The activity reads the stored approval, so two signals that arrive in
         the same tick cannot both use a stale copy. */
      const applied = await activities.applyApprovalDecision({
        approvalId,
        role: next.role,
        name: next.name,
        decision: next.decision,
        rationale: next.rationale
      })
      state = applied
      if (applied.status === 'approved' || applied.status === 'rejected') {
        return { approvalId, ...applied }
      }
      continue
    }

    await condition(() => queue.length > 0 || withdrawn !== null, 6 * HOUR)
  }

  return { approvalId, status: 'timed_out', decisions: state.decisions }
}

/* Bid approval and submission, in the order the spec demands: the deterministic
   gate decides whether the bid may be approved at all; a named human approves;
   only a captured portal receipt may mark it submitted. */
async function bidWorkflow(input) {
  const opportunityId = input && input.opportunityId
  if (!opportunityId) throw ApplicationFailure.nonRetryable('bidWorkflow needs an opportunityId')

  const gate = await activities.evaluateBidApproval({ opportunityId })
  if (!gate.allowed) {
    return { opportunityId, status: 'blocked', blockers: gate.blockers, warnings: gate.warnings }
  }

  let approval = null
  let receipt = null
  setHandler(BID_APPROVAL, (value) => (approval = value))
  setHandler(BID_RECEIPT, (value) => (receipt = value))

  const approvedInTime = await condition(() => approval !== null, input.approvalWindowMs || 72 * HOUR)
  if (!approvedInTime || !approval) {
    return { opportunityId, status: 'approval_timed_out', blockers: ['No signatory approval within the window.'] }
  }

  /* The approver's role is re-checked by the engine inside the activity: a
     signal claiming managing_director from an AI actor is refused there, not
     here, so the refusal is identical to the console's. */
  const approved = await activities.recordBidApproval({
    opportunityId,
    approverRole: approval.role,
    approverName: approval.name
  })
  if (!approved.ok) {
    return { opportunityId, status: 'approval_refused', blockers: approved.blockers }
  }

  const receivedInTime = await condition(() => receipt !== null, input.receiptWindowMs || 24 * HOUR)
  if (!receivedInTime || !receipt) {
    return { opportunityId, status: 'approved_awaiting_receipt', blockers: ['Approved; no portal receipt yet.'] }
  }

  const submitted = await activities.recordBidSubmission({
    opportunityId,
    receipt,
    actorRole: receipt.actorRole || approval.role
  })
  return { opportunityId, status: submitted.ok ? 'submitted' : 'submission_refused', blockers: submitted.blockers }
}

module.exports = { approvalWorkflow, bidWorkflow }

/* Exported so the driver script and tests use the same signal names. Workflow
   signal names are part of the contract between a running workflow and a
   caller; a typo means a signal that never arrives. */
module.exports.SIGNALS = {
  decision: 'decision',
  withdraw: 'withdraw',
  bidApproval: 'bid_approval',
  bidReceipt: 'bid_receipt'
}
