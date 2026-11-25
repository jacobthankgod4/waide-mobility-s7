/**
 * Write-path release-gate tests.
 *
 * These assert that the four consequential mutations - supplier admission, PO
 * issuance, payment preparation/release and bid submission - are blocked in code
 * unless every prerequisite is satisfied. They exercise the same engines the
 * server actions call, so a passing UI cannot bypass a failing control.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { evaluateAdmission, nextState, requirementsFor } from "../lib/engines/admission.mjs";
import { evaluatePurchaseOrder } from "../lib/engines/purchaseOrder.mjs";
import { evaluatePaymentPreparation, evaluatePaymentRelease } from "../lib/engines/paymentControl.mjs";
import { evaluateBidApproval, evaluateBidSubmission } from "../lib/engines/bidSubmission.mjs";
import { applyDecision } from "../lib/engines/approvals.mjs";
import { transition } from "../lib/engines/workflow.mjs";

const check = (id, passed = true, evidence = "Evidence on file") => ({ id, label: id, passed, evidence: passed ? evidence : null });

function supplierAt(state, overrides = {}) {
  return {
    id: "SUP-TEST",
    legalName: "Acme Medical Ltd",
    state,
    sanctionsStatus: "clear",
    beneficiary: { name: "Acme Medical Ltd", verified: true },
    checks: [],
    ...overrides,
  };
}

const S1_CHECKS = () => [
  check("registration", true, "CAC RC 1234567"),
  check("ubo", true, "Ownership register 2026-10"),
  check("contacts", true, "Callback to listed switchboard"),
  check("sanctions", true, "OFAC/UN clear 2026-11-24"),
  check("bank", true, "Bank confirmation letter"),
];

const S2_CHECKS = () => [
  ...S1_CHECKS(),
  check("factory", true, "Factory audit report"),
  check("products", true, "Model list verified"),
  check("certificates", true, "ISO 13485 certificate"),
  check("export", true, "Destination registration"),
  check("capacity", true, "Audited accounts FY2"),
];

const S3_CHECKS = () => [
  ...S2_CHECKS(),
  check("pastSupply", true, "Three signed contracts"),
  check("quality", true, "No open recalls"),
  check("shipping", true, "Delivery records"),
  check("terms", true, "Signed supply agreement"),
  check("conflict", true, "Declaration signed"),
];

// ---- Supplier admission ----------------------------------------------------

test("admission: a supplier cannot skip from S0 to S2", () => {
  const result = evaluateAdmission({ supplier: supplierAt("S0", { checks: S2_CHECKS() }), target: "S2" });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("cannot skip")));
});

test("admission: S0 to S1 is blocked until every identity requirement carries evidence", () => {
  const partial = supplierAt("S0", { checks: S1_CHECKS().slice(0, 3) });
  const result = evaluateAdmission({ supplier: partial, target: "S1" });
  assert.equal(result.allowed, false);
  assert.equal(result.missing.length, 2);
  assert.ok(result.blockers.some((b) => b.includes("lack evidence")));
});

test("admission: a passed check with no evidence reference does not count", () => {
  const checks = S1_CHECKS();
  checks[0] = { id: "registration", label: "registration", passed: true, evidence: "   " };
  const result = evaluateAdmission({ supplier: supplierAt("S0", { checks }), target: "S1" });
  assert.equal(result.allowed, false);
  assert.ok(result.missing.some((m) => m.id === "registration"));
});

test("admission: S0 to S1 passes when all five requirements are evidenced", () => {
  const result = evaluateAdmission({ supplier: supplierAt("S0", { checks: S1_CHECKS() }), target: "S1" });
  assert.equal(result.allowed, true);
  assert.equal(result.satisfied.length, requirementsFor("S1").length);
});

test("admission: S1 to S2 requires the cumulative S1 and S2 evidence", () => {
  const onlyS2 = supplierAt("S1", { checks: S2_CHECKS().filter((c) => ["factory", "products", "certificates", "export", "capacity"].includes(c.id)) });
  const blocked = evaluateAdmission({ supplier: onlyS2, target: "S2" });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.missing.length, 5);

  const full = evaluateAdmission({ supplier: supplierAt("S1", { checks: S2_CHECKS() }), target: "S2" });
  assert.equal(full.allowed, true);
});

test("admission: a confirmed sanctions match blocks every promotion", () => {
  const result = evaluateAdmission({
    supplier: supplierAt("S0", { checks: S1_CHECKS(), sanctionsStatus: "confirmed_match" }),
    target: "S1",
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("confirmed restricted-party")));
});

test("admission: a potential match blocks until a documented false-positive resolution exists", () => {
  const supplier = supplierAt("S0", { checks: S1_CHECKS(), sanctionsStatus: "potential_match" });
  const held = evaluateAdmission({ supplier, target: "S1" });
  assert.equal(held.allowed, false);

  const cleared = evaluateAdmission({
    supplier,
    target: "S1",
    screenings: [{ supplierId: supplier.id, resolved: true, status: "false_positive" }],
  });
  assert.equal(cleared.allowed, true);
});

test("admission: a beneficiary name that differs from the legal entity blocks S2", () => {
  const result = evaluateAdmission({
    supplier: supplierAt("S1", { checks: S2_CHECKS(), beneficiary: { name: "Different Trading Name", verified: true } }),
    target: "S2",
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("does not match the contracting entity")));
});

test("admission: nextState walks S0 -> S1 -> S2 -> S3 and stops", () => {
  assert.equal(nextState("S0"), "S1");
  assert.equal(nextState("S1"), "S2");
  assert.equal(nextState("S2"), "S3");
  assert.equal(nextState("S3"), null);
});

// ---- Purchase order --------------------------------------------------------

const CONTRACT = {
  id: "CT-TEST",
  reference: "TEST-001",
  title: "Test supply",
  status: "active",
  currency: "USD",
  value: 100000,
  buyerObligations: [],
  supplierObligations: [],
};

const QUALIFIED_SUPPLIER = supplierAt("S2");

function poInput(overrides = {}) {
  return {
    contract: CONTRACT,
    supplier: QUALIFIED_SUPPLIER,
    amount: 100000,
    currency: "USD",
    actorRole: "managing_director",
    existingPos: [],
    committed: 0,
    liquidity: 590000,
    obligationVerdict: "back_to_back",
    approval: null,
    dualThreshold: 250000,
    ...overrides,
  };
}

test("po: an S0 supplier blocks issuance", () => {
  const result = evaluatePurchaseOrder(poInput({ supplier: supplierAt("S0") }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("requires S2")));
});

test("po: a duplicate live purchase order is blocked", () => {
  const result = evaluatePurchaseOrder(poInput({ existingPos: [{ poNumber: "PO-1", contractId: "CT-TEST", status: "accepted" }] }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("already exists")));
});

test("po: insufficient liquidity blocks the commitment", () => {
  const result = evaluatePurchaseOrder(poInput({ liquidity: 50000, committed: 0 }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("exceeds available headroom")));
});

test("po: an AI agent has no authority to issue a PO", () => {
  const result = evaluatePurchaseOrder(poInput({ actorRole: "ai_agent" }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("no legal signature")));
});

test("po: a procurement officer with a zero limit must obtain Managing Director approval", () => {
  const result = evaluatePurchaseOrder(poInput({ actorRole: "procurement_officer" }));
  assert.equal(result.allowed, false);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.requiresApproval, true);
  assert.ok(result.requiredRoles.includes("managing_director"));
});

test("po: the Managing Director may issue within limit and back-to-back", () => {
  const result = evaluatePurchaseOrder(poInput());
  assert.equal(result.allowed, true);
  assert.equal(result.requiresApproval, false);
});

test("po: above the dual threshold requires both finance and MD decisions", () => {
  const amount = 300000;
  const held = evaluatePurchaseOrder(poInput({ amount, liquidity: 590000 }));
  assert.equal(held.allowed, false);
  assert.equal(held.requiresApproval, true);
  assert.deepEqual(new Set(held.requiredRoles), new Set(["finance_approver", "managing_director"]));

  const approved = evaluatePurchaseOrder(
    poInput({
      amount,
      approval: {
        id: "AP-1",
        status: "approved",
        decisions: [{ role: "finance_approver" }, { role: "managing_director" }],
      },
    }),
  );
  assert.equal(approved.allowed, true);
});

test("po: an expired approval no longer authorises issuance", () => {
  const stale = new Date(Date.now() - 73 * 3600000).toISOString();
  const expired = evaluatePurchaseOrder(
    poInput({
      actorRole: "procurement_officer",
      approval: {
        id: "AP-OLD",
        status: "approved",
        decidedAt: stale,
        decisions: [{ role: "managing_director" }],
      },
    }),
  );
  assert.equal(expired.allowed, false);
  assert.ok(expired.warnings.some((w) => w.includes("older than")));

  const fresh = evaluatePurchaseOrder(
    poInput({
      actorRole: "procurement_officer",
      approval: {
        id: "AP-NEW",
        status: "approved",
        decidedAt: new Date().toISOString(),
        decisions: [{ role: "managing_director" }],
      },
    }),
  );
  assert.equal(fresh.allowed, true);
});

test("po: non-back-to-back buyer obligations block issuance", () => {
  const result = evaluatePurchaseOrder(poInput({ obligationVerdict: "reject_or_legal_review" }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("not back-to-back")));
});

// ---- Payment preparation and release ---------------------------------------

const PO = { poNumber: "PO-1", contractId: "CT-TEST", amount: 100000, currency: "USD", quantity: 10, beneficiaryName: "Acme Medical Ltd" };
const INVOICE = {
  id: "INV-1",
  invoiceNumber: "ACM/2026/001",
  poNumber: "PO-1",
  contractId: "CT-TEST",
  amount: 100000,
  currency: "USD",
  beneficiaryName: "Acme Medical Ltd",
  status: "matched",
  invoiceDate: "2026-11-01",
};
const DELIVERY = { poNumber: "PO-1", quantityAccepted: 10, acceptanceEvidence: "Proof of delivery" };

function prepInput(overrides = {}) {
  return {
    invoice: INVOICE,
    po: PO,
    delivery: DELIVERY,
    supplier: QUALIFIED_SUPPLIER,
    payments: [],
    invoices: [INVOICE],
    ...overrides,
  };
}

test("payment: preparation is blocked without delivery evidence", () => {
  const result = evaluatePaymentPreparation(prepInput({ delivery: null }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("Three-way match")));
});

test("payment: preparation is blocked when the supplier is not S2/S3", () => {
  const result = evaluatePaymentPreparation(prepInput({ supplier: supplierAt("S1") }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("requires S2")));
});

test("payment: preparation is blocked for a duplicate invoice", () => {
  const duplicate = { ...INVOICE, id: "INV-2" };
  const result = evaluatePaymentPreparation(prepInput({ invoices: [INVOICE, duplicate] }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("duplicate invoice")));
});

test("payment: a matched invoice with delivery passes preparation", () => {
  const result = evaluatePaymentPreparation(prepInput());
  assert.equal(result.allowed, true);
  assert.equal(result.match.state, "matched");
});

const PAYMENT = { id: "PAY-1", state: "approval_pending", amount: 100000, currency: "USD", beneficiaryName: "Acme Medical Ltd" };
const MATCH = { state: "matched" };
const FIN_APPROVAL = { id: "AP-PAY", status: "approved", decisions: [{ role: "finance_approver" }] };

test("payment: release is blocked without an approval record", () => {
  const result = evaluatePaymentRelease({ payment: PAYMENT, actorRole: "finance_approver", approval: null, match: MATCH });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("No approval record")));
});

test("payment: release is blocked for the AI agent", () => {
  const result = evaluatePaymentRelease({ payment: PAYMENT, actorRole: "ai_agent", approval: FIN_APPROVAL, match: MATCH });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("no legal signature")));
});

test("payment: release is blocked when the approval is still pending", () => {
  const result = evaluatePaymentRelease({
    payment: PAYMENT,
    actorRole: "finance_approver",
    approval: { id: "AP-PAY", status: "pending", decisions: [] },
    match: MATCH,
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("requires an approved decision")));
});

test("payment: finance may release a matched, approved instruction within limit", () => {
  const result = evaluatePaymentRelease({ payment: PAYMENT, actorRole: "finance_approver", approval: FIN_APPROVAL, match: MATCH });
  assert.equal(result.allowed, true);
});

test("payment: an approval bound to a different payload cannot release", () => {
  const payment = { ...PAYMENT, payloadHash: "hash-of-100k-to-acme" };
  const result = evaluatePaymentRelease({
    payment,
    actorRole: "finance_approver",
    approval: { ...FIN_APPROVAL, payloadHash: "hash-of-a-different-instruction" },
    match: MATCH,
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("Material terms changed")), JSON.stringify(result.blockers));

  const same = evaluatePaymentRelease({
    payment,
    actorRole: "finance_approver",
    approval: { ...FIN_APPROVAL, payloadHash: "hash-of-100k-to-acme" },
    match: MATCH,
  });
  assert.equal(same.allowed, true);
});

test("payment: an expired approval cannot release", () => {
  const payment = { ...PAYMENT, payloadHash: "hash-1" };
  const stale = new Date(Date.now() - 73 * 3600000).toISOString();
  const result = evaluatePaymentRelease({
    payment,
    actorRole: "finance_approver",
    approval: { ...FIN_APPROVAL, payloadHash: "hash-1", decidedAt: stale },
    match: MATCH,
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("refresh required")));
});

test("payment: above the finance limit requires a Managing Director decision", () => {
  const large = { ...PAYMENT, amount: 300000 };
  const financeOnly = evaluatePaymentRelease({ payment: large, actorRole: "finance_approver", approval: FIN_APPROVAL, match: MATCH });
  assert.equal(financeOnly.allowed, false);
  assert.ok(financeOnly.requiredRoles.includes("managing_director"));

  const both = evaluatePaymentRelease({
    payment: large,
    actorRole: "managing_director",
    approval: { id: "AP-PAY", status: "approved", decisions: [{ role: "finance_approver" }, { role: "managing_director" }] },
    match: MATCH,
  });
  assert.equal(both.allowed, true);
});

test("payment: a broken three-way match blocks release even when approved", () => {
  const result = evaluatePaymentRelease({
    payment: PAYMENT,
    actorRole: "finance_approver",
    approval: FIN_APPROVAL,
    match: { state: "blocked" },
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("Three-way match")));
});

// ---- Bid approval and submission -------------------------------------------

const OPPORTUNITY = { id: "OPP-TEST", stage: "eligible", estimatedValue: 100000 };
const READY_GATE = { verdict: "bid_ready", blockers: [] };
const MARGIN = { decision: "eligible", contributionPct: 30, rationale: "above floor" };
const CASH = { curve: { funded: true } };
const DEADLINE = { expired: false, utc: "2026-12-01T12:00:00Z" };

function bidInput(overrides = {}) {
  return {
    opportunity: OPPORTUNITY,
    gate: READY_GATE,
    margin: MARGIN,
    cash: CASH,
    deadline: DEADLINE,
    actorRole: "managing_director",
    marginException: null,
    ...overrides,
  };
}

test("bid: approval is blocked when the gate holds", () => {
  const result = evaluateBidApproval(bidInput({ gate: { verdict: "hold", blockers: [{ label: "Cash" }] } }));
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("holds")));
});

test("bid: approval is blocked when the margin is below floor", () => {
  const result = evaluateBidApproval(bidInput({ margin: { decision: "below_floor", contributionPct: 9, rationale: "below floor" } }));
  assert.equal(result.allowed, false);
});

test("bid: a pricing-review margin requires an approved exception", () => {
  const review = { decision: "pricing_review", contributionPct: 18, rationale: "between floor and target" };
  const blocked = evaluateBidApproval(bidInput({ margin: review }));
  assert.equal(blocked.allowed, false);

  const allowed = evaluateBidApproval(bidInput({ margin: review, marginException: { status: "approved" } }));
  assert.equal(allowed.allowed, true);
});

test("bid: approval is blocked for a non-eligible stage or expired deadline", () => {
  assert.equal(evaluateBidApproval(bidInput({ opportunity: { ...OPPORTUNITY, stage: "analysed" } })).allowed, false);
  assert.equal(evaluateBidApproval(bidInput({ deadline: { expired: true, utc: "2026-01-01" } })).allowed, false);
});

test("bid: the Managing Director may approve a bid-ready opportunity", () => {
  const result = evaluateBidApproval(bidInput());
  assert.equal(result.allowed, true);
});

test("bid: only the Managing Director may approve", () => {
  const result = evaluateBidApproval(bidInput({ actorRole: "finance_approver" }));
  assert.equal(result.allowed, false);
});

test("bid: submission is blocked without a portal receipt", () => {
  const result = evaluateBidSubmission({
    opportunity: { ...OPPORTUNITY, stage: "bid_approved" },
    receipt: {},
    actorRole: "managing_director",
  });
  assert.equal(result.allowed, false);
  assert.ok(result.blockers.some((b) => b.includes("no official receipt")));
});

test("bid: submission is blocked before the bid is approved", () => {
  const result = evaluateBidSubmission({
    opportunity: { ...OPPORTUNITY, stage: "eligible" },
    receipt: { officialReference: "UNGM-123" },
    actorRole: "managing_director",
  });
  assert.equal(result.allowed, false);
});

test("bid: submission passes with an approved bid, MD authority and a receipt", () => {
  const result = evaluateBidSubmission({
    opportunity: { ...OPPORTUNITY, stage: "bid_approved" },
    receipt: { officialReference: "UNGM-123" },
    actorRole: "managing_director",
  });
  assert.equal(result.allowed, true);
  assert.equal(result.proof.confirmed, true);
});

// ---- Approval aggregation ---------------------------------------------------

test("approval: dual control needs two distinct authorities", () => {
  const base = { id: "AP-100", status: "pending", requiredRoles: ["compliance_officer", "managing_director"], decisions: [] };
  const first = applyDecision(base, { role: "compliance_officer", name: "Compliance Officer" }, new Date("2026-01-01T00:00:00Z"));
  assert.equal(first.ok, true);
  assert.equal(first.status, "awaiting_second");
  assert.equal(first.secondApproverRole, "managing_director");

  const repeat = applyDecision(
    { ...base, status: first.status, decisions: first.decisions },
    { role: "compliance_officer", name: "Compliance Officer" },
    new Date("2026-01-01T00:05:00Z"),
  );
  assert.equal(repeat.ok, false);
  assert.equal(repeat.status, "awaiting_second");
  assert.match(repeat.reason, /distinct authority/);
  assert.equal(repeat.decisions.length, 1);

  const second = applyDecision(
    { ...base, status: first.status, decisions: first.decisions },
    { role: "managing_director", name: "Managing Director" },
    new Date("2026-01-01T00:10:00Z"),
  );
  assert.equal(second.ok, true);
  assert.equal(second.status, "approved");
  assert.equal(second.decisions.length, 2);
});

test("approval: a single-authority approval closes on one decision", () => {
  const result = applyDecision(
    { id: "AP-101", status: "pending", requiredRoles: ["managing_director"], decisions: [] },
    { role: "managing_director", name: "Managing Director" },
  );
  assert.equal(result.ok, true);
  assert.equal(result.status, "approved");
});

test("approval: a role that is not a required authority cannot decide", () => {
  const result = applyDecision(
    { id: "AP-102", status: "pending", requiredRoles: ["finance_approver"], decisions: [] },
    { role: "procurement_officer", name: "Procurement Officer" },
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /not a required authority/);
  assert.equal(result.decisions.length, 0);
});

test("approval: a closed, blocked or unowned approval accepts no decision", () => {
  for (const status of ["approved", "rejected", "blocked"]) {
    const result = applyDecision(
      { id: "AP-103", status, requiredRoles: ["managing_director"], decisions: [] },
      { role: "managing_director", name: "Managing Director" },
    );
    assert.equal(result.ok, false, `status ${status} must refuse`);
  }
  const unowned = applyDecision(
    { id: "AP-104", status: "pending", requiredRoles: [], decisions: [] },
    { role: "managing_director", name: "Managing Director" },
  );
  assert.equal(unowned.ok, false);
});

test("approval: rejection closes the approval without adding an approval decision", () => {
  const result = applyDecision(
    { id: "AP-105", status: "pending", requiredRoles: ["managing_director", "finance_approver"], decisions: [] },
    { role: "finance_approver", name: "Finance Approver", decision: "reject", rationale: "Beneficiary unverified." },
  );
  assert.equal(result.ok, true);
  assert.equal(result.status, "rejected");
  assert.equal(result.decisions.length, 0);
  assert.equal(result.rationale, "Beneficiary unverified.");
});

// ---- State-machine alignment ----------------------------------------------

test("workflow: the write path only uses legal transitions", () => {
  assert.equal(transition("supplier", "S0", "S1").ok, true);
  assert.equal(transition("supplier", "S0", "S2").ok, false);
  assert.equal(transition("supplier", "S1", "S2").ok, true);
  assert.equal(transition("supplier", "S2", "S3").ok, true);
  assert.equal(transition("opportunity", "eligible", "bid_approved").ok, true);
  assert.equal(transition("opportunity", "bid_approved", "submitted").ok, true);
  assert.equal(transition("payment", "approval_pending", "approved").ok, true);
  assert.equal(transition("payment", "approved", "released").ok, true);
});
