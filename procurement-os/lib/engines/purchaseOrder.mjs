/**
 * Purchase-order issuance gate.
 *
 * Spec pages 48, 30, 31. A PO creates a binding supplier obligation, so it is
 * blocked unless the supplier is qualified, the contract is live, the funding is
 * real, the buyer obligations are back-to-back and the acting role is delegated.
 * An AI or a procurement officer with zero financial limit cannot issue one.
 */

import { authorize, ROLES, FINANCIAL_LIMITS } from "./policy.mjs";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sameEntity(a, b) {
  const n = (v) =>
    String(v ?? "")
      .toLowerCase()
      .replace(/\b(ltd|limited|plc|llc|bv|gmbh|inc)\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  return n(a) === n(b);
}

/**
 * @param {object} input
 * @param {object} input.contract
 * @param {object} input.supplier
 * @param {number} input.amount
 * @param {string} input.currency
 * @param {string} input.actorRole
 * @param {Array} [input.existingPos]
 * @param {number} [input.committed]  accepted PO value already committed
 * @param {number} [input.liquidity]  cleared cash + approved facility
 * @param {string|null} [input.obligationVerdict]
 * @param {object|null} [input.approval]
 * @param {number} [input.dualThreshold]
 */
export function evaluatePurchaseOrder(input) {
  const {
    contract,
    supplier,
    amount,
    currency = "USD",
    actorRole,
    existingPos = [],
    committed = 0,
    liquidity = 0,
    obligationVerdict = null,
    approval = null,
    dualThreshold = FINANCIAL_LIMITS.dualApprovalThreshold,
  } = input;

  const blockers = [];
  const warnings = [];
  const value = num(amount);

  if (!contract) blockers.push("No contract exists to issue a purchase order against.");
  if (!supplier) blockers.push("No supplier is linked to the contract; a PO cannot be issued to an unknown entity.");

  if (contract && ["closed", "terminated"].includes(contract.status)) {
    blockers.push(`Contract ${contract.id} is ${contract.status}; no new purchase order may be issued.`);
  }

  if (supplier) {
    if (!["S2", "S3"].includes(supplier.state)) {
      blockers.push(`Supplier ${supplier.legalName} is ${supplier.state}; a PO requires S2 (technically approved) or S3.`);
    }
    if (supplier.sanctionsStatus !== "clear") {
      blockers.push(`Supplier screening is ${String(supplier.sanctionsStatus).replace(/_/g, " ")}; a PO is frozen until resolved.`);
    }
    if (supplier.beneficiary?.name && !sameEntity(supplier.beneficiary.name, supplier.legalName)) {
      blockers.push("Bank beneficiary does not match the contracting entity; payment diversion risk blocks the commitment.");
    }
  }

  const live = existingPos.find((po) => po.contractId === contract?.id && ["issued", "accepted"].includes(po.status));
  if (live) blockers.push(`Purchase order ${live.poNumber} already exists for this contract; a duplicate obligation is blocked.`);

  if (value <= 0) blockers.push("Purchase-order value must be greater than zero.");

  if (contract && obligationVerdict === "reject_or_legal_review") {
    blockers.push("Buyer obligations are not back-to-back with the supplier; issuing a PO would leave uncapped exposure with Waide.");
  }

  const headroom = num(liquidity) - num(committed);
  if (value > headroom) {
    blockers.push(
      `Purchase-order value ${money(value, currency)} exceeds available headroom ${money(headroom, currency)} (cleared cash + approved facility - committed POs).`,
    );
  }

  const auth = authorize("po.issue", actorRole, { amount: value });
  if (!auth.allowed) blockers.push(...auth.reasons);

  // Escalation is MD + Finance. The requesting procurement role is never a
  // required approver of its own commitment, so it is deliberately excluded.
  const requiredRoles = new Set();
  let requiresApproval = false;
  if (auth.allowed && auth.mode === "dual") {
    requiresApproval = true;
    requiredRoles.add("managing_director");
    requiredRoles.add("finance_approver");
  }

  const limit = ROLES[actorRole]?.approvalLimit;
  if (limit !== null && limit !== undefined && value > limit) {
    requiresApproval = true;
    requiredRoles.add("managing_director");
    warnings.push(`${ROLES[actorRole]?.label ?? actorRole} approval limit is ${money(limit, currency)}; Managing Director authority is required.`);
  }
  if (value >= dualThreshold) {
    requiresApproval = true;
    requiredRoles.add("managing_director");
    requiredRoles.add("finance_approver");
  }

  const approvalSatisfied = approvalSatisfiedBy(approval, requiredRoles);
  if (approval && approval.status === "approved" && !approvalSatisfied && approvalExpired(approval)) {
    warnings.push(`Approval ${approval.id} is older than ${FINANCIAL_LIMITS.approvalExpiryHours}h and no longer authorises this commitment; obtain a fresh decision.`);
  }

  return {
    allowed: blockers.length === 0 && (!requiresApproval || approvalSatisfied),
    amount: value,
    currency,
    blockers,
    warnings,
    auth,
    requiresApproval,
    requiredRoles: [...requiredRoles],
    approvalSatisfied,
    approval: approval ? { id: approval.id, status: approval.status } : null,
    reason:
      blockers.length === 0 && (!requiresApproval || approvalSatisfied)
        ? "Supplier qualified, contract live, funding real, obligations back-to-back and authority satisfied."
        : "Purchase order is blocked pending the listed controls.",
  };
}

export function approvalSatisfiedBy(approval, requiredRoles, now = new Date()) {
  if (!approval || approval.status !== "approved") return false;
  if (approvalExpired(approval, now)) return false;
  const satisfied = new Set((approval.decisions ?? []).map((d) => d.role));
  return [...requiredRoles].every((role) => satisfied.has(role));
}

/** An approval older than the policy window may not release a new commitment. */
export function approvalExpired(approval, now = new Date()) {
  if (!approval?.decidedAt) return false;
  const decided = new Date(approval.decidedAt).getTime();
  if (!Number.isFinite(decided)) return false;
  return now.getTime() - decided > FINANCIAL_LIMITS.approvalExpiryHours * 3600000;
}

function money(v, currency = "USD") {
  return `${currency} ${Math.round(num(v)).toLocaleString("en-US")}`;
}
