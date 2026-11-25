/**
 * WAOC deterministic authority engine.
 *
 * Spec pages 4, 5, 21, 27, 30, 33, 81, 82.
 * Authority is data, not prose: the LLM never decides its own permission.
 * Every action is resolved against a capability table and the acting role.
 */

export const POLICY_VERSION = "WAOC-1.0.0";

/** Seeded role definitions. `null` limit means unlimited within delegated scope. */
export const ROLES = {
  managing_director: {
    id: "managing_director",
    label: "Managing Director",
    canSign: true,
    approvalLimit: null,
  },
  finance_approver: {
    id: "finance_approver",
    label: "Finance Approver",
    canSign: false,
    approvalLimit: 250000,
  },
  legal_reviewer: {
    id: "legal_reviewer",
    label: "Legal Reviewer",
    canSign: false,
    approvalLimit: null,
  },
  compliance_officer: {
    id: "compliance_officer",
    label: "Compliance Officer",
    canSign: false,
    approvalLimit: null,
  },
  procurement_officer: {
    id: "procurement_officer",
    label: "Procurement Officer",
    canSign: false,
    approvalLimit: 0,
  },
  ai_agent: {
    id: "ai_agent",
    label: "AI Procurement Agent",
    canSign: false,
    approvalLimit: 0,
  },
};

/**
 * Capability table. `mode`:
 *  - autonomous : safe work, no human in the loop
 *  - prepared   : agent prepares, a human executes
 *  - human      : requires named human authority
 *  - dual       : requires two distinct human authorities
 *  - prohibited : never permitted, including for humans inside the platform
 */
export const CAPABILITIES = {
  "opportunity.monitor": { mode: "autonomous", roles: ["ai_agent", "procurement_officer"], label: "Monitor procurement sources" },
  "tender.extract": { mode: "autonomous", roles: ["ai_agent", "procurement_officer"], label: "Extract tender requirements" },
  "supplier.rfq": { mode: "autonomous", roles: ["ai_agent", "procurement_officer"], label: "Issue supplier RFQ" },
  "supplier.followup": { mode: "autonomous", roles: ["ai_agent", "procurement_officer"], label: "Routine supplier follow-up" },
  "supplier.promote.S1": { mode: "human", roles: ["compliance_officer", "managing_director"], label: "Promote supplier to S1" },
  "supplier.promote.S2": { mode: "human", roles: ["compliance_officer", "managing_director"], label: "Promote supplier to S2" },
  "supplier.promote.S3": { mode: "dual", roles: ["compliance_officer", "managing_director"], label: "Promote supplier to S3" },
  "supplier.suspend": { mode: "human", roles: ["compliance_officer", "managing_director"], label: "Suspend supplier" },
  "bid.submit": { mode: "human", roles: ["managing_director"], label: "Final bid submission" },
  "bid.price.final": { mode: "human", roles: ["managing_director", "finance_approver"], label: "Final buyer quotation" },
  "bid.technical.equivalence": { mode: "human", roles: ["managing_director", "legal_reviewer"], label: "Assert product equivalence" },
  "contract.sign": { mode: "human", roles: ["managing_director"], label: "Sign contract or declaration" },
  "contract.accept": { mode: "dual", roles: ["managing_director", "legal_reviewer"], label: "Accept contract terms" },
  "contract.variation": { mode: "dual", roles: ["managing_director", "legal_reviewer"], label: "Contract variation or waiver" },
  "margin.exception": { mode: "dual", roles: ["managing_director", "finance_approver"], label: "Approve below-floor margin" },
  "supplier.advance": { mode: "dual", roles: ["managing_director", "finance_approver"], label: "Approve supplier advance" },
  "guarantee.issue": { mode: "dual", roles: ["managing_director", "finance_approver", "legal_reviewer"], label: "Issue guarantee or bond" },
  "payment.prepare": { mode: "prepared", roles: ["ai_agent", "finance_approver"], label: "Prepare payment instruction" },
  "payment.release": { mode: "human", roles: ["finance_approver", "managing_director"], label: "Release payment" },
  "beneficiary.change": { mode: "dual", roles: ["finance_approver", "managing_director"], label: "Change supplier bank beneficiary" },
  "po.issue": { mode: "human", roles: ["managing_director", "procurement_officer"], label: "Issue purchase order" },
  "declaration.personal": { mode: "prohibited", roles: [], label: "AI personal attestation" },
  "portal.bypass.mfa": { mode: "prohibited", roles: [], label: "Bypass MFA / CAPTCHA" },
  "bank.transfer.autonomous": { mode: "prohibited", roles: [], label: "Autonomous money movement" },
  "sanctions.waive": { mode: "prohibited", roles: [], label: "Waive sanctions hold" },
};

/** Value claims in the seeded policy that are operating controls, not law. */
export const FINANCIAL_LIMITS = {
  automatedSupplierPrepayment: 0,
  automatedUnconditionalPurchaseCommitment: 0,
  automatedPaymentGuarantee: 0,
  automatedCreditFacility: 0,
  dualApprovalThreshold: 250000,
  beneficiaryCoolingOffHours: 48,
  approvalExpiryHours: 72,
};

/**
 * Resolve whether an actor may perform an action.
 * @param {string} actionId
 * @param {string} actorRole
 * @param {object} [context]
 */
export function authorize(actionId, actorRole, context = {}) {
  const capability = CAPABILITIES[actionId];
  const role = ROLES[actorRole];

  if (!capability) {
    return deny(actionId, actorRole, `Unknown capability "${actionId}" - fail closed.`);
  }
  if (!role) {
    return deny(actionId, actorRole, `Unknown actor role "${actorRole}" - fail closed.`);
  }
  if (capability.mode === "prohibited") {
    return deny(actionId, actorRole, `${capability.label} is prohibited by WAOC for every actor, including AI.`);
  }
  if (actorRole === "ai_agent" && capability.mode !== "autonomous" && capability.mode !== "prepared") {
    return deny(actionId, actorRole, `AI has no legal signature or approval authority for "${capability.label}".`);
  }
  if (!capability.roles.includes(actorRole)) {
    return deny(actionId, actorRole, `Role ${role.label} is not delegated for "${capability.label}".`);
  }

  const reasons = [];
  let mode = capability.mode;

  // Value-sensitive escalation (pages 33, 82).
  const amount = Number(context.amount || 0);
  const required = new Set([actorRole]);
  if (amount >= FINANCIAL_LIMITS.dualApprovalThreshold && mode !== "autonomous") {
    mode = "dual";
    reasons.push(`Value ${formatMoney(amount)} is at or above the dual-approval threshold.`);
  }
  if (mode === "dual") {
    capability.roles.forEach((r) => required.add(r));
    reasons.push("Two distinct human authorities are required and must be separately recorded.");
  }
  if (actorRole === "ai_agent") {
    reasons.push("AI output is a recommendation; the side effect requires the delegated human step.");
  }

  return {
    action: actionId,
    label: capability.label,
    actorRole,
    mode,
    allowed: true,
    requiresApproval: mode !== "autonomous",
    requiredRoles: [...required],
    reasons,
    policyVersion: POLICY_VERSION,
  };
}

/** Financial-authority check used by payment, advance and PO flows. */
export function assertFinancialAuthority(kind, amount, actorRole) {
  const zero = [
    "automatedSupplierPrepayment",
    "automatedUnconditionalPurchaseCommitment",
    "automatedPaymentGuarantee",
    "automatedCreditFacility",
  ];
  if (zero.includes(kind) && (actorRole === "ai_agent" || actorRole === "procurement_officer")) {
    return {
      allowed: false,
      limit: FINANCIAL_LIMITS[kind],
      reason: `Automated authority for ${kind} is ${formatMoney(FINANCIAL_LIMITS[kind])}; a human approval record is mandatory.`,
    };
  }
  return { allowed: true, limit: FINANCIAL_LIMITS[kind] ?? null, reason: "Delegated human authority applies." };
}

/** Approval expiry: an approval may not be reused after material change (page 82). */
export function approvalStillValid(approval, currentPayloadHash, now = new Date()) {
  if (!approval || approval.status !== "approved") return { valid: false, reason: "No approved decision on record." };
  if (approval.payloadHash !== currentPayloadHash) {
    return { valid: false, reason: "Material terms changed after approval; the approval is void and must be re-obtained." };
  }
  const decided = new Date(approval.decidedAt).getTime();
  const ageHours = (now.getTime() - decided) / 3600000;
  if (ageHours > FINANCIAL_LIMITS.approvalExpiryHours) {
    return { valid: false, reason: `Approval older than ${FINANCIAL_LIMITS.approvalExpiryHours}h; refresh required.` };
  }
  return { valid: true, reason: "Approval is current and bound to the present terms." };
}

function deny(actionId, actorRole, reason) {
  return {
    action: actionId,
    label: CAPABILITIES[actionId]?.label ?? actionId,
    actorRole,
    mode: "denied",
    allowed: false,
    requiresApproval: true,
    requiredRoles: [],
    reasons: [reason],
    policyVersion: POLICY_VERSION,
  };
}

function formatMoney(v) {
  return `USD ${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
