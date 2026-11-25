/**
 * Bid approval and submission gate.
 *
 * Spec pages 45, 46, 82, 89. Two distinct human steps:
 *   approve  - the deterministic bid gate must be bid_ready, the margin and cash
 *              models must clear, and the opportunity must be eligible.
 *   submit   - only from bid_approved, only with an official portal receipt. The
 *              status may never read "submitted" without captured proof.
 */

import { authorize } from "./policy.mjs";
import { assertSubmissionProof } from "./gates.mjs";

/**
 * @param {object} input
 * @param {object} input.opportunity
 * @param {object} input.gate           evaluateBidGate() result
 * @param {object|null} [input.margin]
 * @param {object|null} [input.cash]
 * @param {object} [input.deadline]     resolveDeadline() result
 * @param {string} input.actorRole
 * @param {object|null} [input.marginException] approved margin.exception record
 */
export function evaluateBidApproval(input) {
  const { opportunity, gate, margin, cash, deadline, actorRole, marginException = null } = input;
  const blockers = [];
  const warnings = [];

  if (!opportunity) return { allowed: false, blockers: ["Opportunity not found."] };
  if (opportunity.stage !== "eligible") {
    blockers.push(`Opportunity stage is ${opportunity.stage}; only an eligible opportunity may be approved for bid.`);
  }
  if (!gate) {
    blockers.push("No bid gate result is available.");
  } else if (gate.verdict !== "bid_ready") {
    blockers.push(
      gate.verdict === "no_bid"
        ? `Bid gate failed: ${gate.blockers.filter((b) => b.status === "fail").map((b) => b.label).join("; ")}.`
        : `Bid gate holds on ${gate.blockers.length} unresolved check(s): ${gate.blockers.map((b) => b.label).join("; ")}.`,
    );
  }
  if (deadline?.expired) blockers.push(`Deadline passed at ${deadline.utc}; a late submission is not permitted.`);

  if (margin) {
    if (margin.decision === "pricing_review") {
      if (marginException?.status === "approved") warnings.push("Below-target margin covered by an approved pricing exception.");
      else blockers.push(`Contribution ${margin.contributionPct}% is between floor and target; a pricing exception is required before approval.`);
    } else if (margin.decision !== "eligible") {
      blockers.push(`Margin decision is ${margin.decision.replace(/_/g, " ")}: ${margin.rationale}`);
    }
  }
  if (cash && !cash.curve.funded) blockers.push(cash.curve.blockingReason ?? "Peak cash requirement exceeds approved liquidity.");

  const auth = authorize("bid.submit", actorRole, { amount: opportunity.estimatedValue });
  if (!auth.allowed) blockers.push(...auth.reasons);

  return {
    allowed: blockers.length === 0,
    blockers,
    warnings,
    auth,
    reason:
      blockers.length === 0
        ? "All mandatory gates pass and the acting role is delegated to approve the bid."
        : "Bid approval is blocked pending the listed controls.",
  };
}

/**
 * @param {object} input
 * @param {object} input.opportunity
 * @param {object} input.receipt  { officialReference, portalReceiptUrl, confirmationScreenshot, capturedAt }
 * @param {string} input.actorRole
 */
export function evaluateBidSubmission(input) {
  const { opportunity, receipt, actorRole } = input;
  const blockers = [];

  if (!opportunity) return { allowed: false, blockers: ["Opportunity not found."], proof: null };
  if (opportunity.stage !== "bid_approved") {
    blockers.push(`Opportunity stage is ${opportunity.stage}; submission requires an approved bid first.`);
  }

  const proof = assertSubmissionProof(receipt ?? {});
  if (!proof.confirmed) blockers.push(proof.reason);

  const auth = authorize("bid.submit", actorRole, { amount: opportunity.estimatedValue });
  if (!auth.allowed) blockers.push(...auth.reasons);

  return {
    allowed: blockers.length === 0,
    blockers,
    proof,
    auth,
    reason:
      blockers.length === 0
        ? "Approved bid, authorised signatory and captured portal receipt; submission may be recorded."
        : "Submission is blocked pending the listed controls.",
  };
}
