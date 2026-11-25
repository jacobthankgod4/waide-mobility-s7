/**
 * Bid readiness gate.
 *
 * Spec pages 45, 46, 79, 89. Fail closed: an UNKNOWN is a blocker, never a pass.
 * The verdict is deterministic application code; agent reasoning cannot override it.
 */

export const CHECK_DEFINITIONS = [
  { id: "legal_entity", label: "Legal entity verified & consistent", page: 10 },
  { id: "mandatory_requirements", label: "All mandatory requirements evidenced", page: 39 },
  { id: "requirements_unambiguous", label: "No ambiguous mandatory requirement", page: 39 },
  { id: "supplier_approved", label: "Every product supplier is S2 or S3", page: 16 },
  { id: "supplier_sanctions", label: "All transaction parties screened clear", page: 17 },
  { id: "product_regulatory", label: "Product approved for destination market", page: 14 },
  { id: "export_control", label: "Export-control classification clear", page: 57 },
  { id: "jurisdictions_complete", label: "Jurisdictional chain complete", page: 7 },
  { id: "margin", label: "Contribution margin at/above floor or exception", page: 19 },
  { id: "cost_completeness", label: "No unknown direct cost", page: 19 },
  { id: "cash", label: "Peak cash need within approved liquidity", page: 22 },
  { id: "liability", label: "Material obligations back-to-back or priced", page: 28 },
  { id: "amendment", label: "Latest tender amendment incorporated", page: 46 },
  { id: "deadline", label: "Deadline in future (local + UTC verified)", page: 46 },
  { id: "evidence_current", label: "All attached evidence unexpired", page: 35 },
  { id: "signatory", label: "Authorised signatory available", page: 27 },
];

/**
 * @param {object} input
 * @param {Record<string, {status:"pass"|"fail"|"unknown", note?:string, evidence?:string}>} input.results
 * @returns {{verdict:string, blockers:Array, warnings:Array, checks:Array, bidReady:boolean, summary:string, page:number}}
 */
export function evaluateBidGate(results = {}) {
  const checks = CHECK_DEFINITIONS.map((def) => {
    const provided = results[def.id];
    const status = provided?.status ?? "unknown";
    return {
      ...def,
      status,
      note: provided?.note ?? (provided ? "" : "No evidence recorded - treated as unknown."),
      evidence: provided?.evidence ?? null,
      blocking: status !== "pass",
    };
  });

  const blockers = checks.filter((c) => c.status === "fail" || c.status === "unknown");
  const warnings = checks.filter((c) => c.status === "warning");

  const failedHard = blockers.filter((c) => c.status === "fail");
  const unknown = blockers.filter((c) => c.status === "unknown");

  let verdict = "bid_ready";
  if (failedHard.length) verdict = "no_bid";
  else if (unknown.length) verdict = "hold";

  return {
    verdict,
    bidReady: verdict === "bid_ready",
    blockers,
    warnings,
    checks,
    summary:
      verdict === "bid_ready"
        ? "All mandatory gates passed. Commercial and technical readiness confirmed."
        : verdict === "no_bid"
          ? `${failedHard.length} hard gate failure(s): bid is not permissible until remedied or a tender-permitted remedy is confirmed.`
          : `${unknown.length} unresolved gate(s): the system holds rather than assuming compliance.`,
    page: 45,
  };
}

/**
 * Portal submission requires an official receipt (page 46).
 */
export function assertSubmissionProof(record) {
  if (!record?.officialReference && !record?.portalReceiptUrl && !record?.confirmationScreenshot) {
    return {
      confirmed: false,
      reason: "Submission is not complete: no official receipt, reference number or portal status was captured. Status cannot read 'submitted'.",
    };
  }
  return {
    confirmed: true,
    reference: record.officialReference ?? record.portalReceiptUrl,
    capturedAt: record.capturedAt ?? null,
  };
}

/**
 * Contract closeout gate (page 52, 88).
 */
export function canCloseContract(state = {}) {
  const outstanding = [];
  if (!state.deliveryAccepted) outstanding.push("Buyer acceptance certificate not received");
  if (num(state.outstandingPayments) !== 0) outstanding.push("Outstanding payable/receivable balance remains");
  if ((state.openClaims ?? []).length) outstanding.push(`${state.openClaims.length} open claim(s)`);
  if ((state.openWarrantyObligations ?? []).length) outstanding.push(`${state.openWarrantyObligations.length} live warranty obligation(s)`);
  if (!state.invoicesReconciled) outstanding.push("Invoices not reconciled");
  return {
    closable: outstanding.length === 0,
    outstanding,
    reason:
      outstanding.length === 0
        ? "All deliverables, acceptance, payments, claims and ongoing obligations are accounted for."
        : "Contract cannot close while material obligations remain open.",
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
