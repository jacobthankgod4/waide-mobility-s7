/**
 * End-to-end verification of the write path against a running server.
 *
 * This drives the real Next.js server actions over HTTP - the same forms a human
 * uses - and then reads the store to confirm each gate refused or released.
 * It deliberately starts from a clean synthetic seed, walks the four
 * consequential flows (admission, PO, payment, bid) and asserts the negative
 * cases as well as the positive ones.
 *
 *   npm run seed                  # optional; the script reseeds itself
 *   npm run dev                   # in another terminal
 *   npm run verify
 *
 * Exits non-zero if any assertion fails.
 */

import { resetStore, loadStore, loadLedger } from "../lib/data/store.mjs";
import { verifyChain } from "../lib/engines/ledger.mjs";

const BASE = process.env.WPOS_URL ?? "http://127.0.0.1:4780";
const supplierId = "SUP-TZ-006";
const contractId = "CT-2026-005";
const opportunityId = "OPP-2026-018";

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const store = () => loadStore();

function supplier(id = supplierId) {
  return store().suppliers.find((s) => s.id === id);
}

function approvalByAction(action, subjectId) {
  return store().approvals.find((a) => a.action === action && a.subjectId === subjectId);
}

async function get(path, actor) {
  const res = await fetch(BASE + path, {
    headers: actor ? { cookie: `wpos_actor=${actor}` } : {},
    redirect: "manual",
  });
  const body = await res.text();
  if (res.status !== 200) throw new Error(`GET ${path} -> ${res.status}: ${body.slice(0, 300)}`);
  return body;
}

/** Find the action id of the first form whose markup contains every marker. */
function actionFor(html, ...markers) {
  for (const part of html.split("<form")) {
    const id = part.match(/\$ACTION_ID_[a-f0-9]+/);
    if (!id) continue;
    if (markers.every((marker) => part.includes(marker))) return id[0];
  }
  throw new Error(`No form found containing: ${markers.join(", ")}`);
}

async function post(path, actor, actionId, fields) {
  const body = new FormData();
  body.append(actionId, "");
  for (const [key, value] of Object.entries(fields)) body.append(key, String(value));
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { cookie: `wpos_actor=${actor}` },
    body,
    redirect: "manual",
  });
  const location = decodeURIComponent(res.headers.get("location") ?? "");
  return { status: res.status, location, error: location.includes("error=") };
}

function errorText(location) {
  const marker = location.indexOf("error=");
  return marker === -1 ? "" : location.slice(marker + 6);
}

// ---- Supplier admission -----------------------------------------------------

async function verifyAdmission() {
  console.log(`\nAdmission — ${supplierId} from S0`);
  check("seeded supplier starts at S0", supplier().state === "S0", supplier().state);

  let html = await get(`/suppliers/${supplierId}`, "u-comp");
  const promoteAction = actionFor(html, 'name="target"');
  const evidenceAction = actionFor(html, 'name="evidence_registration"');

  const promote = (target) =>
    post(`/suppliers/${supplierId}`, "u-comp", promoteAction, { supplierId, target, returnTo: `/suppliers/${supplierId}` });

  const noEvidence = await promote("S1");
  check("S1 is refused with no evidence", noEvidence.error, noEvidence.location);
  check("S1 refusal leaves the supplier at S0", supplier().state === "S0", supplier().state);
  check("S1 refusal names the missing requirements", /lack evidence/.test(errorText(noEvidence.location)), errorText(noEvidence.location));

  const s1Evidence = {
    evidence_registration: "BRELA certificate of incorporation, verified 2026-11-24",
    evidence_ubo: "Ownership register signed by director, 2026-10-30",
    evidence_contacts: "Independent callback to published switchboard, 2026-11-24",
    evidence_sanctions: "OFAC SDN + UN consolidated screen, 2026-11-24, no match",
    evidence_bank: "Bank confirmation letter naming the company, 2026-10-12",
  };
  let result = await post(`/suppliers/${supplierId}`, "u-comp", evidenceAction, {
    supplierId,
    returnTo: `/suppliers/${supplierId}`,
    ...s1Evidence,
  });
  check("S1 evidence recorded", !result.error, result.location);

  result = await promote("S1");
  check("S1 promotion succeeds with evidence", !result.error, result.location);
  check("supplier is S1", supplier().state === "S1", supplier().state);

  result = await promote("S2");
  check("S2 is refused while S2 evidence is missing", result.error, result.location);
  check("supplier stays S1", supplier().state === "S1", supplier().state);

  const s2Evidence = {
    evidence_factory: "Factory audit report AR-2026-11",
    evidence_products: "Product list and datasheets verified against manufacturer site",
    evidence_certificates: "ISO 9001 certificate verified with issuing body",
    evidence_export: "Destination market import registration confirmed",
    evidence_capacity: "Audited accounts FY2025 and production capacity letter",
  };
  await post(`/suppliers/${supplierId}`, "u-comp", evidenceAction, {
    supplierId,
    returnTo: `/suppliers/${supplierId}`,
    ...s2Evidence,
  });
  result = await promote("S2");
  check("S2 promotion succeeds with evidence", !result.error, result.location);
  check("supplier is S2", supplier().state === "S2", supplier().state);

  const s3Evidence = {
    evidence_pastSupply: "Three signed institutional supply contracts on file",
    evidence_quality: "No recalls or open complaints; warranty log reviewed",
    evidence_shipping: "Delivery records for three shipments verified",
    evidence_terms: "Signed supply agreement with fixed prices and validity",
    evidence_conflict: "Signed conflict-of-interest declaration dated 2026-11-24",
  };
  await post(`/suppliers/${supplierId}`, "u-comp", evidenceAction, {
    supplierId,
    returnTo: `/suppliers/${supplierId}`,
    ...s3Evidence,
  });

  result = await promote("S3");
  check("S3 requires dual approval", result.error && /Dual approval required/.test(errorText(result.location)), result.location);
  check("S3 is not granted before approval", supplier().state === "S2", supplier().state);

  const approval = approvalByAction("supplier.promote.S3", supplierId);
  check("dual approval record created", Boolean(approval), "missing");
  check(
    "approval requires compliance + MD",
    approval && approval.requiredRoles.includes("compliance_officer") && approval.requiredRoles.includes("managing_director"),
    JSON.stringify(approval?.requiredRoles),
  );

  html = await get("/approvals", "u-comp");
  const decideAction = actionFor(html, `value="${approval.id}"`);

  result = await post("/approvals", "u-comp", decideAction, {
    approvalId: approval.id,
    decision: "approve",
    rationale: "Admission file complete.",
    returnTo: "/approvals",
  });
  check("first authority records a decision", !result.error, result.location);
  check("approval awaits the second authority", approvalByAction("supplier.promote.S3", supplierId).status === "awaiting_second");

  result = await post("/approvals", "u-comp", decideAction, {
    approvalId: approval.id,
    decision: "approve",
    rationale: "Second look.",
    returnTo: "/approvals",
  });
  check("the same authority cannot decide twice", result.error, result.location);
  check(
    "refused duplicate is not appended",
    approvalByAction("supplier.promote.S3", supplierId).decisions.filter((d) => d.role === "compliance_officer").length === 1,
  );

  result = await post("/approvals", "u-md", decideAction, {
    approvalId: approval.id,
    decision: "approve",
    rationale: "Approved on the compliance recommendation.",
    returnTo: "/approvals",
  });
  check("second distinct authority approves", !result.error, result.location);
  check("approval is approved", approvalByAction("supplier.promote.S3", supplierId).status === "approved");

  result = await promote("S3");
  check("S3 promotion succeeds after dual approval", !result.error, result.location);
  check("supplier is S3", supplier().state === "S3", supplier().state);
  check("admission is attributed in the record", supplier().admission?.target === "S3", JSON.stringify(supplier().admission));
}

// ---- Purchase order ---------------------------------------------------------

async function verifyPurchaseOrder() {
  console.log(`\nPurchase order — ${contractId}`);

  const html = await get(`/contracts/${contractId}`, "u-proc");
  const issueAction = actionFor(html, `value="${contractId}"`);
  const fields = {
    contractId,
    returnTo: `/contracts/${contractId}`,
    amount: 148000,
    quantity: 1,
    unit: "lot",
    description: "Water network GIS and asset-twin licence",
    incotermRule: "DAP",
    namedPlace: "Nairobi, Kenya",
  };

  let result = await post(`/contracts/${contractId}`, "u-proc", issueAction, fields);
  check("procurement officer is held for approval", result.error && /Approval required/.test(errorText(result.location)), result.location);
  check("no PO exists before approval", !store().purchaseOrders.some((p) => p.contractId === contractId));

  const approval = approvalByAction("po.issue", contractId);
  check("PO approval record created", Boolean(approval), "missing");
  check("procurement is not an approver of its own commitment", approval && !approval.requiredRoles.includes("procurement_officer"), JSON.stringify(approval?.requiredRoles));

  const approvalsPage = await get("/approvals", "u-md");
  const decideAction = actionFor(approvalsPage, `value="${approval.id}"`);
  result = await post("/approvals", "u-md", decideAction, {
    approvalId: approval.id,
    decision: "approve",
    rationale: "Funding and obligations verified.",
    returnTo: "/approvals",
  });
  check("MD approves the PO", !result.error, result.location);

  result = await post(`/contracts/${contractId}`, "u-proc", issueAction, fields);
  check("PO is issued after approval", !result.error, result.location);

  const po = store().purchaseOrders.find((p) => p.contractId === contractId);
  check("issued PO carries the contract value", po?.amount === 148000 && po?.status === "issued", JSON.stringify(po && { amount: po.amount, status: po.status }));
  check("PO beneficiary is the supplier", po?.beneficiaryName === supplier("SUP-KE-001").legalName, po?.beneficiaryName);
  check("contract advances to fulfilment", store().contracts.find((c) => c.id === contractId).status === "fulfilment");

  result = await post(`/contracts/${contractId}`, "u-proc", issueAction, fields);
  check("a second PO on the same contract is refused", result.error, result.location);
}

// ---- Payment ----------------------------------------------------------------

async function verifyPayment() {
  console.log("\nPayment — INV-0004 / PO-00003");

  let html = await get("/finance", "u-fin");
  const prepareAction = actionFor(html, 'value="INV-0004"');
  let result = await post("/finance", "u-fin", prepareAction, { invoiceId: "INV-0004", returnTo: "/finance" });
  check("matched invoice prepares a payment", !result.error, result.location);

  const payment = store().payments.find((p) => p.invoiceId === "INV-0004");
  check("payment is approval-pending, not released", payment?.state === "approval_pending", payment?.state);
  check("payment carries a payload hash", typeof payment?.payloadHash === "string" && payment.payloadHash.length === 16, payment?.payloadHash);

  html = await get("/finance", "u-md");
  check("no release control is offered while approval is pending", !html.includes('name="paymentId"'));

  const approval = approvalByAction("payment.release", payment.id);
  check("payment approval requires finance", approval && approval.requiredRoles.includes("finance_approver"), JSON.stringify(approval?.requiredRoles));
  check("approval is bound to the payment payload", approval?.payloadHash === payment.payloadHash, approval?.payloadHash);

  const approvalsPage = await get("/approvals", "u-fin");
  const decideAction = actionFor(approvalsPage, `value="${approval.id}"`);
  result = await post("/approvals", "u-fin", decideAction, {
    approvalId: approval.id,
    decision: "approve",
    rationale: "Three-way match clean; beneficiary verified.",
    returnTo: "/approvals",
  });
  check("finance approves the payment", !result.error, result.location);
  check("approval moves the payment to approved", store().payments.find((p) => p.id === payment.id).state === "approved");

  html = await get("/finance", "u-md");
  const releaseAgain = actionFor(html, `value="${payment.id}"`);
  result = await post("/finance", "u-md", releaseAgain, { paymentId: payment.id, returnTo: "/finance" });
  check("MD releases the approved payment", !result.error, result.location);

  const released = store().payments.find((p) => p.id === payment.id);
  check("payment is released", released.state === "released", released.state);
  check("release names the approver", (released.approvedBy ?? []).includes("Finance Approver"), JSON.stringify(released.approvedBy));
  check("release names the executor", released.releasedBy === "u-md", released.releasedBy);

  result = await post("/finance", "u-md", releaseAgain, { paymentId: payment.id, returnTo: "/finance" });
  check("a second release of the same payment is refused", result.error, result.location);
  check("payment stays released", store().payments.find((p) => p.id === payment.id).state === "released");
}

// ---- Bid --------------------------------------------------------------------

async function verifyBid() {
  console.log(`\nBid — ${opportunityId}`);

  let html = await get(`/opportunities/${opportunityId}`, "u-md");
  const approveAction = actionFor(html, `value="${opportunityId}"`);

  let result = await post(`/opportunities/${opportunityId}`, "u-fin", approveAction, { opportunityId, returnTo: `/opportunities/${opportunityId}` });
  check("finance cannot approve a bid", result.error, result.location);
  check("stage is unchanged after refusal", store().opportunities.find((o) => o.id === opportunityId).stage === "eligible");

  result = await post(`/opportunities/${opportunityId}`, "u-md", approveAction, { opportunityId, returnTo: `/opportunities/${opportunityId}` });
  check("MD approves the bid", !result.error, result.location);
  check("stage is bid_approved", store().opportunities.find((o) => o.id === opportunityId).stage === "bid_approved");

  html = await get(`/opportunities/${opportunityId}`, "u-md");
  const submitAction = actionFor(html, 'name="officialReference"');

  result = await post(`/opportunities/${opportunityId}`, "u-md", submitAction, {
    opportunityId,
    returnTo: `/opportunities/${opportunityId}`,
    officialReference: "",
    portalReceiptUrl: "",
  });
  check("submission without a receipt is refused", result.error && /no official receipt/.test(errorText(result.location)), result.location);
  check("stage cannot read submitted without proof", store().opportunities.find((o) => o.id === opportunityId).stage === "bid_approved");

  result = await post(`/opportunities/${opportunityId}`, "u-md", submitAction, {
    opportunityId,
    returnTo: `/opportunities/${opportunityId}`,
    officialReference: "KPLC-EP-2026-018841",
    portalReceiptUrl: "https://example-procurement.ke/receipt/018841",
  });
  check("submission with a receipt is accepted", !result.error, result.location);
  const opp = store().opportunities.find((o) => o.id === opportunityId);
  check("stage is submitted", opp.stage === "submitted", opp.stage);
  check("the official reference is stored", opp.submission?.officialReference === "KPLC-EP-2026-018841", opp.submission?.officialReference);
}

// ---- Ledger -----------------------------------------------------------------

function verifyLedger() {
  console.log("\nLedger");
  const ledger = loadLedger();
  check("ledger is non-empty after the run", ledger.length > 0, String(ledger.length));
  check("ledger hash chain verifies", verifyChain(ledger).valid, JSON.stringify(verifyChain(ledger)));
  for (const action of ["supplier.promoted", "po.issued", "payment.released", "bid.submitted"]) {
    check(`ledger records ${action}`, ledger.some((e) => e.action === action));
  }
}

// ---- Main -------------------------------------------------------------------

async function main() {
  console.log(`Reseeding and verifying against ${BASE}`);
  resetStore();
  try {
    await get("/");
  } catch (err) {
    console.error(`\nServer is not reachable at ${BASE}. Start it with: npm run dev\n${err.message}`);
    process.exit(1);
  }

  await verifyAdmission();
  await verifyPurchaseOrder();
  await verifyPayment();
  await verifyBid();
  verifyLedger();

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) {
    console.log(`Failed: ${failures.join(" | ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
