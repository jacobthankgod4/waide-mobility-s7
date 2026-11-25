/**
 * Payment preparation and release control.
 *
 * Spec pages 30, 31, 33, 86. Preparation and execution are separate: the agent
 * or finance may prepare a matched instruction, but only a delegated human may
 * release it, and only after an approval record bound to the instruction exists.
 *
 * No payment is prepared unless the three-way match passes, the beneficiary
 * agrees, the supplier is qualified and the invoice is not a duplicate.
 */

import { threeWayMatch, detectDuplicates } from "./match3.mjs";
import { authorize, ROLES, FINANCIAL_LIMITS, approvalStillValid } from "./policy.mjs";

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
 * @param {object} input.invoice
 * @param {object} [input.po]
 * @param {object} [input.delivery]
 * @param {object} [input.supplier]
 * @param {Array} [input.payments]
 * @param {Array} [input.invoices]
 */
export function evaluatePaymentPreparation(input) {
  const { invoice, po, delivery, supplier, payments = [], invoices = [] } = input;
  const blockers = [];

  if (!invoice) {
    return { allowed: false, blockers: ["Invoice not found."], match: null, duplicates: null };
  }
  if (!po) blockers.push("No purchase order on record; an invoice cannot be matched to an obligation.");
  if (!supplier) blockers.push("No supplier is linked to the invoice.");
  if (supplier) {
    if (!["S2", "S3"].includes(supplier.state)) {
      blockers.push(`Supplier ${supplier.legalName} is ${supplier.state}; payment requires S2 or S3.`);
    }
    if (supplier.sanctionsStatus !== "clear") {
      blockers.push(`Supplier screening is ${String(supplier.sanctionsStatus).replace(/_/g, " ")}; payment is frozen.`);
    }
  }

  if (["exception", "held", "rejected"].includes(invoice.status)) {
    blockers.push(`Invoice status is ${invoice.status}; it must be resolved before a payment can be prepared.`);
  }

  const match = po ? threeWayMatch({ po, invoice, delivery }) : null;
  if (match && match.state !== "matched") {
    blockers.push(`Three-way match is ${match.state.replace(/_/g, " ")}: ${match.exceptions.map((e) => e.message).join(" ")}`);
  }

  const duplicates = detectDuplicates(
    { ...invoice, invoiceNumber: invoice.invoiceNumber, invoiceDate: invoice.invoiceDate },
    invoices.filter((i) => i.id !== invoice.id),
  );
  if (duplicates.duplicate) {
    blockers.push("A duplicate invoice with the same beneficiary, amount and period already exists.");
  }

  const paymentDuplicate = detectDuplicates(
    { ...invoice, invoiceNumber: invoice.invoiceNumber, invoiceDate: invoice.invoiceDate },
    payments.map((p) => {
      const paidInvoice = invoices.find((i) => i.id === p.invoiceId);
      return {
        ...p,
        invoiceNumber: paidInvoice?.invoiceNumber ?? p.reference ?? p.id,
        invoiceDate: paidInvoice?.invoiceDate ?? p.valueDate,
      };
    }),
  );
  if (paymentDuplicate.duplicate) {
    blockers.push("A payment for this invoice already exists; duplicate payment is blocked.");
  }

  if (po && invoice.beneficiaryName && po.beneficiaryName && !sameEntity(invoice.beneficiaryName, po.beneficiaryName)) {
    blockers.push("Invoice beneficiary differs from the purchase-order beneficiary; payment diversion risk.");
  }

  return {
    allowed: blockers.length === 0,
    blockers,
    match,
    duplicates,
    deliveryRecorded: Boolean(delivery),
    reason:
      blockers.length === 0
        ? "PO, invoice and delivery/acceptance agree; the instruction may be prepared for approval."
        : "Payment preparation is held pending the listed controls.",
  };
}

/**
 * @param {object} input
 * @param {object} input.payment
 * @param {string} input.actorRole
 * @param {object|null} [input.approval]
 * @param {object|null} [input.match]
 * @param {number} [input.dualThreshold]
 */
export function evaluatePaymentRelease(input) {
  const { payment, actorRole, approval = null, match = null, dualThreshold = FINANCIAL_LIMITS.dualApprovalThreshold } = input;
  const blockers = [];

  if (!payment) return { allowed: false, blockers: ["Payment instruction not found."], requiredRoles: [] };
  if (!["approval_pending", "approved"].includes(payment.state)) {
    blockers.push(`Payment state is ${payment.state}; only a prepared, approved instruction may be released.`);
  }

  const auth = authorize("payment.release", actorRole, { amount: payment.amount });
  if (!auth.allowed) blockers.push(...auth.reasons);

  /* The approval record states which authorities had to decide before release.
     That set is authoritative; falling back to the acting role's capability
     would demand a second decision from whoever happens to execute it. */
  const declaredRoles = (approval?.requiredRoles ?? []).filter(Boolean);
  const requiredRoles = new Set(declaredRoles.length ? declaredRoles : auth.allowed ? auth.requiredRoles : []);
  const warnings = [];
  if (num(payment.amount) >= dualThreshold) {
    requiredRoles.add("finance_approver");
    requiredRoles.add("managing_director");
  }
  const limit = ROLES[actorRole]?.approvalLimit;
  if (limit !== null && limit !== undefined && num(payment.amount) > limit) {
    requiredRoles.add("managing_director");
    warnings.push(
      `${ROLES[actorRole]?.label ?? actorRole} approval limit is ${money(limit)}; a payment of ${money(payment.amount)} needs Managing Director authority.`,
    );
  }

  if (!approval || approval.status !== "approved") {
    blockers.push(
      approval
        ? `Approval ${approval.id} is ${approval.status}; release requires an approved decision.`
        : "No approval record exists for this payment; prepare it first.",
    );
  } else {
    /* The approval is bound to the instruction it approved. A changed amount,
       beneficiary or an expired decision must void it, not inherit authority. */
    if (payment.payloadHash) {
      const validity = approvalStillValid(approval, payment.payloadHash);
      if (!validity.valid) blockers.push(validity.reason);
    }
    const decided = new Set((approval.decisions ?? []).map((d) => d.role));
    const missing = [...requiredRoles].filter((role) => !decided.has(role));
    if (missing.length) blockers.push(`Approval ${approval.id} is missing required authority: ${missing.join(", ")}.`);
  }

  if (match && match.state !== "matched") {
    blockers.push(`Three-way match is ${match.state.replace(/_/g, " ")}; release is blocked.`);
  }

  return {
    allowed: blockers.length === 0,
    blockers,
    warnings,
    requiredRoles: [...requiredRoles],
    auth,
    reason:
      blockers.length === 0
        ? "Approved, matched and within the acting role's authority; release may proceed."
        : "Release is blocked pending the listed controls.",
  };
}

function money(v) {
  return `USD ${Math.round(num(v)).toLocaleString("en-US")}`;
}
