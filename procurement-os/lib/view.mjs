/**
 * View models. Each screen receives engine-derived facts rather than raw rows,
 * so a UI label can always be traced back to a deterministic control.
 */

import { calculateContribution, riskAdjustedMargin, realisedMargin, SECTOR_MARGINS } from "./engines/margin.mjs";
import { buildCashCurve, stressScenarios } from "./engines/cashflow.mjs";
import { scoreCountry, jurisdictionMap } from "./engines/country.mjs";
import { evaluateBidGate, canCloseContract } from "./engines/gates.mjs";
import { resolveDeadline } from "./engines/tender.mjs";
import { screenParty } from "./engines/sanctions.mjs";
import { evaluateEvidence, freshness, detectIdentityConflicts, attributionCheck } from "./engines/evidence.mjs";
import { buildObligationMatrix, commitmentDecision } from "./engines/obligations.mjs";
import { threeWayMatch, detectDuplicates } from "./engines/match3.mjs";
import { nigeriaImportGate, checkIncoterm } from "./engines/incoterms.mjs";
import { evaluateOutbound, scanInbound } from "./engines/comms.mjs";
import { authorize } from "./engines/policy.mjs";
import { verifyChain } from "./engines/ledger.mjs";
import { evaluateAdmission, nextState } from "./engines/admission.mjs";
import { evaluatePurchaseOrder } from "./engines/purchaseOrder.mjs";
import { evaluatePaymentPreparation, evaluatePaymentRelease } from "./engines/paymentControl.mjs";
import { evaluateBidApproval, evaluateBidSubmission } from "./engines/bidSubmission.mjs";

export function money(v, currency = "USD") {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${currency === "USD" ? "$" : `${currency} `}${n < 0 ? "-" : ""}${formatted}`;
}

export function compactMoney(v) {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

// ---- Cash model for a priced bid -------------------------------------------

export function buildCashFromBid(bid, settings) {
  const depositPct = Number(bid.supplierTerms?.depositPct ?? 0) / 100;
  const supplierLine = bid.costs.find((c) => c.key === "supplier_price");
  const supplier = Number(supplierLine?.amount ?? 0);
  const otherCosts = bid.costs
    .filter((c) => c.key !== "supplier_price" && c.key !== "contingency")
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const advance = (Number(bid.revenue) * Number(bid.paymentTerms?.buyerAdvancePct ?? 0)) / 100;
  const receivable = Number(bid.paymentTerms?.receivableDays ?? 60);

  const events = [
    { date: dayOffset(0), direction: "in", amount: advance, label: "Buyer advance (if cleared)", fundingClass: advance > 0 ? "cleared" : "uncommitted" },
    { date: dayOffset(5), direction: "out", amount: supplier * depositPct, label: `Supplier deposit ${Math.round(depositPct * 100)}%`, fundingClass: "committed_facility" },
    { date: dayOffset(45), direction: "out", amount: supplier * (1 - depositPct) + otherCosts, label: "Supplier balance + logistics at shipment", fundingClass: "committed_facility" },
    { date: dayOffset(60), direction: "out", amount: Number(bid.financingCost ?? 0), label: "Financing cost", fundingClass: "committed_facility" },
    { date: dayOffset(75 + receivable), direction: "in", amount: Number(bid.revenue) - advance, label: `Buyer payment (${receivable}-day terms)`, fundingClass: "expected" },
  ].filter((e) => e.amount > 0);

  const opts = { startingCash: settings.startingCash, approvedFacility: settings.approvedFacility };
  return { curve: buildCashCurve(events, opts), scenarios: stressScenarios(events, { ...opts, buyerDelayDays: 45 }), events };
}

function dayOffset(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---- Opportunity ------------------------------------------------------------

export function buildOpportunityView(store, opp, now = new Date(), actor = null) {
  const sector = store.sectors.find((s) => s.code === opp.sectorCode) ?? SECTOR_MARGINS.C;
  const bid = store.bidModels.find((b) => b.opportunityId === opp.id);
  const margin = bid ? calculateContribution(bid, sector) : null;
  const risk = bid && margin
    ? riskAdjustedMargin({
        contributionPct: margin.contributionPct,
        revenue: bid.revenue,
        buyerAdvancePct: bid.paymentTerms?.buyerAdvancePct,
        receivableDays: bid.paymentTerms?.receivableDays,
        supplierDepositPct: bid.supplierTerms?.depositPct,
        costOfCapitalPct: store.settings.costOfCapitalPct,
        paymentConfidence: opp.buyerCountry === "NG" ? "medium" : "high",
      })
    : null;
  const cash = bid ? buildCashFromBid(bid, store.settings) : null;
  const deadline = resolveDeadline(opp.deadline.local, opp.deadline.timeZone, now);
  const suppliers = (opp.links?.supplierIds ?? []).map((id) => store.suppliers.find((s) => s.id === id)).filter(Boolean);
  const docs = (opp.links?.documentIds ?? []).map((id) => store.documents.find((d) => d.id === id)).filter(Boolean);
  const country = store.countries.find((c) => c.code === opp.buyerCountry);
  const countryScore = country ? scoreCountry(country, now) : null;
  const jurisdictions = jurisdictionMap(opp.jurisdictions ?? {});
  const incoterm = checkIncoterm(opp.incoterm ?? {});
  const identityDocs = docs.filter((d) => d.legalEntity === store.legalEntity.registeredName);
  const identity = detectIdentityConflicts(store.legalEntity, identityDocs);
  const evidenceChecks = docs.map((d) => evaluateEvidence(d, {
    legalEntity: store.legalEntity.registeredName,
    purpose: "bid_attachment",
    productModel: opp.products?.[0]?.model,
  }, now));

  const mandatory = opp.requirements.filter((r) => r.mandatory);
  const unsourcedMandatory = mandatory.filter((r) => r.status === "satisfied" && !r.evidence);
  const productDocMatch = docs.find((d) => d.productModel && d.productModel === opp.products?.[0]?.model);
  const requiresProductRegistration = ["A2", "A3"].includes(opp.sectorCode);
  const sanctionsStates = suppliers.map((s) => s.sanctionsStatus);
  const amendmentPending = (opp.amendments ?? []).some((a) => !a.incorporated);
  const requiresExportClassification = Boolean(opp.jurisdictions?.usOriginTechnology) || opp.products?.some((p) => /dual|sensor/i.test(p.description));

  const results = {
    legal_entity: identity.clean
      ? { status: store.legalEntity.confirmationStatus === "confirmed" ? "pass" : "warning", note: identity.clean ? "No cross-document identity conflict in the documents relied on for this bid. Registered-name confirmation is still pending with the MD and is carried as a warning in this build." : "" }
      : { status: "fail", note: identity.conflicts[0].message },
    mandatory_requirements: mandatory.some((r) => r.status === "missing")
      ? { status: "fail", note: `${mandatory.filter((r) => r.status === "missing").length} mandatory requirement(s) have no evidence.` }
      : unsourcedMandatory.length
        ? { status: "unknown", note: "A requirement is marked satisfied without an evidence reference." }
        : mandatory.some((r) => r.status === "unsupported")
          ? { status: "fail", note: "Evidence exists but does not support the requirement as written." }
          : { status: "pass", note: `${mandatory.length} mandatory requirements evidenced.` },
    requirements_unambiguous: mandatory.some((r) => r.status === "ambiguous")
      ? { status: "unknown", note: "An ambiguous mandatory requirement must be clarified before submission." }
      : { status: "pass", note: "No unresolved ambiguity in mandatory criteria." },
    supplier_approved: suppliers.length === 0
      ? { status: "fail", note: "No supplier is linked to this opportunity." }
      : suppliers.every((s) => ["S2", "S3"].includes(s.state))
        ? { status: "pass", note: suppliers.map((s) => `${s.legalName} (${s.state})`).join(", ") }
        : { status: "fail", note: suppliers.filter((s) => !["S2", "S3"].includes(s.state)).map((s) => `${s.legalName} is ${s.state}`).join("; ") },
    supplier_sanctions: sanctionsStates.includes("confirmed_match")
      ? { status: "fail", note: "A transaction party is a confirmed restricted-party match." }
      : sanctionsStates.includes("potential_match")
        ? { status: "unknown", note: "A potential screening match is unresolved; the workflow is frozen." }
        : { status: "pass", note: "All linked suppliers screened clear." },
    product_regulatory: !requiresProductRegistration
      ? { status: "pass", note: "No destination product registration applies to this category." }
      : productDocMatch && !evidenceChecks.find((e) => e.docId === productDocMatch.id)?.issues.some((i) => i.code === "scope_mismatch")
        ? { status: "pass", note: `Registration matches model ${productDocMatch.productModel}.` }
        : { status: "fail", note: `No registration on file covers the offered model ${opp.products?.[0]?.model}.` },
    export_control: requiresExportClassification
      ? { status: "unknown", note: "Export-control classification and licence position are not recorded." }
      : { status: "pass", note: "No controlled goods or technology identified." },
    jurisdictions_complete: jurisdictions.verdict === "complete"
      ? { status: "pass", note: `${jurisdictions.nodes.length} jurisdictions mapped, ${jurisdictions.controls.length} control regime(s) in scope.` }
      : { status: "unknown", note: jurisdictions.blockingReason },
    margin: !margin
      ? { status: "unknown", note: "No price model exists." }
      : margin.decision === "eligible"
        ? { status: "pass", note: `Contribution ${margin.contributionPct}% (floor ${margin.sectorFloor}%).` }
        : margin.decision === "pricing_review"
          ? { status: "warning", note: margin.rationale }
          : { status: "fail", note: margin.rationale },
    cost_completeness: !margin
      ? { status: "unknown", note: "No cost ledger." }
      : margin.provisional
        ? { status: "fail", note: `Unknown/missing direct cost: ${[...margin.unknownCosts, ...margin.missingCostLines].join(", ") || "incomplete ledger"}.` }
        : { status: "pass", note: `${margin.costLines.length} cost lines priced and sourced.` },
    cash: !cash
      ? { status: "unknown", note: "No cash model." }
      : cash.curve.funded
        ? { status: "pass", note: `Peak need ${money(cash.curve.peakCashRequirement)} against ${money(cash.curve.liquidityAvailable)} available.` }
        : { status: "fail", note: cash.curve.blockingReason },
    liability: bid && Number(bid.unpricedLiability) > 0
      ? { status: "fail", note: "Unpriced liability present." }
      : (opp.requirements ?? []).some((r) => /bond|guarantee/i.test(r.text))
        ? { status: "unknown", note: "A bond or guarantee is required; no approved instrument exists." }
        : { status: "pass", note: "No uncapped or unpriced obligation identified in the solicitation." },
    amendment: amendmentPending
      ? { status: "fail", note: "An amendment has not been incorporated into the price model." }
      : { status: "pass", note: "All amendments incorporated." },
    deadline: deadline.expired
      ? { status: "fail", note: `Deadline passed (${deadline.utc}).` }
      : { status: "pass", note: `${deadline.display} - ${deadline.hoursRemaining}h remaining.` },
    evidence_current: evidenceChecks.some((e) => !e.attachable)
      ? { status: "fail", note: evidenceChecks.filter((e) => !e.attachable).map((e) => `${e.title}: ${e.verdict}`).join("; ") }
      : { status: "pass", note: `${docs.length} linked document(s) attachable.` },
    signatory: { status: "warning", note: "MD signatory authority is proposed pending a board resolution." },
  };

  const gate = evaluateBidGate(results);
  const marginException =
    store.approvals.find((a) => a.action === "margin.exception" && a.subjectId === opp.id && a.status === "approved") ?? null;
  const bidApproval = evaluateBidApproval({
    opportunity: opp,
    gate,
    margin,
    cash,
    deadline,
    actorRole: actor?.role,
    marginException,
  });
  const bidSubmission = evaluateBidSubmission({ opportunity: opp, receipt: opp.submission ?? {}, actorRole: actor?.role });

  return {
    opp,
    sector,
    bid,
    margin,
    risk,
    cash,
    deadline,
    suppliers,
    docs,
    evidenceChecks,
    country,
    countryScore,
    jurisdictions,
    incoterm,
    identity,
    gate,
    bidApproval,
    bidSubmission,
    marginException,
    mandatory,
    mandatorySatisfied: mandatory.filter((r) => r.status === "satisfied").length,
    amendmentPending,
    openApproval: store.approvals.find((a) => a.subjectId === opp.id && ["pending", "blocked", "awaiting_second"].includes(a.status)) ?? null,
    exception: store.exceptions.filter((e) => e.subjectId === opp.id),
  };
}

export function buildSupplierView(store, supplier, now = new Date()) {
  const screening = screenParty({ legalName: supplier.legalName, country: supplier.country });
  const beneficiaryMatch =
    supplier.beneficiary?.name &&
    supplier.beneficiary.name.toLowerCase().replace(/[^a-z0-9]/g, "") ===
      supplier.legalName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const passed = supplier.checks.filter((c) => c.passed).length;
  const linkedOpps = store.opportunities.filter((o) => (o.links?.supplierIds ?? []).includes(supplier.id));
  const contracts = store.contracts.filter((c) => c.supplierId === supplier.id);
  const payment = store.payments.filter((p) => p.supplierId === supplier.id);
  const docs = store.documents.filter((d) => d.legalEntity === supplier.legalName);
  const target = nextState(supplier.state);
  const admissionGate = target
    ? evaluateAdmission({ supplier, target, screenings: store.screenings })
    : { allowed: false, target: null, blockers: ["Already at the highest admission level."], missing: [], satisfied: [] };

  return {
    supplier,
    screening,
    beneficiaryMatch,
    admission: { passed, total: supplier.checks.length, pct: Math.round((passed / supplier.checks.length) * 100) },
    admissionGate,
    stateMachine: ["S0", "S1", "S2", "S3"],
    linkedOpps,
    contracts,
    payments: payment,
    documents: docs,
    blockers: supplier.checks.filter((c) => !c.passed),
  };
}

export function buildContractView(store, contract, actor = null) {
  const buyer = store.contracts.find((c) => c.id === contract.id);
  const matrix = buildObligationMatrix(contract.buyerObligations ?? [], contract.supplierObligations ?? []);
  const po = store.purchaseOrders.find((p) => p.contractId === contract.id) ?? null;
  const shipment = store.shipments.find((s) => s.contractId === contract.id) ?? null;
  const invoice = store.invoices.find((i) => i.contractId === contract.id) ?? null;
  const payment = store.payments.find((p) => p.contractId === contract.id) ?? null;
  const supplier = store.suppliers.find((s) => s.id === contract.supplierId) ?? null;
  const delivery = shipment
    ? { poNumber: shipment.poNumber, quantity: po?.quantity, quantityAccepted: contract.status === "closed" ? po?.quantity : undefined, acceptanceEvidence: contract.closeout?.deliveryAccepted ? "Acceptance certificate" : null }
    : null;
  const match = po ? threeWayMatch({ po, invoice, delivery }) : null;
  const nigeria = shipment && shipment.destination?.includes("Nigeria") ? nigeriaImportGate(shipment) : null;
  const realised = contract.actuals ? realisedMargin(contract.bidSnapshot, contract.actuals) : null;
  const closeout = canCloseContract(contract.closeout ?? {});

  const committed = store.purchaseOrders.filter((p) => p.status === "accepted").reduce((s, p) => s + Number(p.amount ?? 0), 0);
  const liquidity = Number(store.settings.startingCash) + Number(store.settings.approvedFacility);
  const approval = store.approvals.find((a) => a.action === "po.issue" && a.subjectId === contract.id && a.status === "approved") ?? null;
  const poGate = evaluatePurchaseOrder({
    contract,
    supplier,
    amount: contract.value,
    currency: contract.currency,
    actorRole: actor?.role,
    existingPos: store.purchaseOrders,
    committed,
    liquidity,
    obligationVerdict: matrix.verdict,
    approval,
    dualThreshold: store.settings.dualApprovalThreshold,
  });

  return {
    contract,
    buyer,
    supplier,
    matrix,
    po,
    shipment,
    invoice,
    payment,
    match,
    nigeria,
    realised,
    closeout,
    poGate,
    commitmentCheck: (contract.buyerObligations ?? []).map((o) => ({
      obligation: o,
      policy: o.unlimited ? commitmentDecision("unlimited_indemnity") : null,
    })),
  };
}

export function buildDashboard(store, now = new Date()) {
  const views = store.opportunities.map((o) => buildOpportunityView(store, o, now));
  const pipelineValue = views.reduce((s, v) => s + Number(v.opp.estimatedValue), 0);
  const bidReady = views.filter((v) => v.gate.verdict === "bid_ready");
  const held = views.filter((v) => v.gate.verdict === "hold");
  const noBid = views.filter((v) => v.gate.verdict === "no_bid");
  const blockerCounts = {};
  for (const v of views) for (const b of v.gate.blockers) blockerCounts[b.label] = (blockerCounts[b.label] ?? 0) + 1;

  const ledger = verifyChain(store.ledger ?? []);
  const countries = store.countries.map((c) => scoreCountry(c, now)).sort((a, b) => b.score - a.score);
  const pending = store.approvals.filter((a) => a.status === "pending" || a.status === "blocked");
  const criticalExceptions = store.exceptions.filter((e) => e.severity === "critical" && e.status === "open");

  const marginBand = { eligible: 0, review: 0, blocked: 0 };
  for (const v of views) {
    if (!v.margin) continue;
    if (v.margin.decision === "eligible") marginBand.eligible += 1;
    else if (v.margin.decision === "pricing_review") marginBand.review += 1;
    else marginBand.blocked += 1;
  }

  return {
    views,
    kpi: {
      pipelineValue,
      opportunities: store.opportunities.length,
      bidReady: bidReady.length,
      held: held.length,
      noBid: noBid.length,
      pendingApprovals: pending.length,
      criticalExceptions: criticalExceptions.length,
      suppliersApproved: store.suppliers.filter((s) => ["S2", "S3"].includes(s.state)).length,
      suppliersTotal: store.suppliers.length,
      cash: store.settings.startingCash,
      facility: store.settings.approvedFacility,
    },
    blockerCounts: Object.entries(blockerCounts).sort((a, b) => b[1] - a[1]).slice(0, 6),
    countries: countries.slice(0, 6),
    countriesBlocked: countries.filter((c) => c.blocked),
    pending,
    criticalExceptions,
    marginBand,
    ledger: ledger.valid ? ledger : { valid: false },
    expiring: store.documents
      .map((d) => ({ doc: d, f: freshness(d, d.class, now) }))
      .filter((x) => ["expired", "expiring", "stale", "unverified"].includes(x.f.status))
      .sort((a, b) => (a.f.daysLeft ?? 9999) - (b.f.daysLeft ?? 9999)),
    activeContracts: store.contracts.filter((c) => !["closed", "terminated"].includes(c.status)),
  };
}

export function buildFinanceView(store, now = new Date(), actor = null) {
  const deliveryFor = (po, shipment) =>
    shipment
      ? {
          poNumber: shipment.poNumber,
          quantity: po?.quantity,
          quantityAccepted: shipment.status === "delivered" ? po?.quantity : undefined,
          acceptanceEvidence: shipment.status === "delivered" ? "Proof of delivery / acceptance" : null,
        }
      : null;

  const rows = store.payments.map((p) => {
    const invoice = store.invoices.find((i) => i.id === p.invoiceId) ?? null;
    const po = store.purchaseOrders.find((x) => x.contractId === p.contractId) ?? null;
    const shipment = store.shipments.find((s) => s.contractId === p.contractId) ?? null;
    const delivery = deliveryFor(po, shipment);
    const match = po ? threeWayMatch({ po, invoice, delivery }) : null;
    const duplicates = detectDuplicates({ ...p, invoiceNumber: invoice?.invoiceNumber, invoiceDate: invoice?.invoiceDate }, store.payments.filter((x) => x.id !== p.id).map((x) => ({ ...x, invoiceNumber: store.invoices.find((i) => i.id === x.invoiceId)?.invoiceNumber, invoiceDate: store.invoices.find((i) => i.id === x.invoiceId)?.invoiceDate })));
    const beneficiaryOk = po?.beneficiaryName && p.beneficiaryName
      ? po.beneficiaryName.toLowerCase().replace(/[^a-z0-9]/g, "") === p.beneficiaryName.toLowerCase().replace(/[^a-z0-9]/g, "")
      : true;
    const approval = store.approvals.find((a) => a.action === "payment.release" && a.subjectId === p.id) ?? null;
    const release = evaluatePaymentRelease({
      payment: p,
      actorRole: actor?.role,
      approval,
      match,
      dualThreshold: store.settings.dualApprovalThreshold,
    });
    return { payment: p, invoice, po, shipment, match, duplicates, beneficiaryOk, approval, release };
  });

  const invoices = store.invoices.map((i) => {
    const dupes = detectDuplicates(i, store.invoices.filter((x) => x.id !== i.id));
    const po = store.purchaseOrders.find((x) => x.poNumber === i.poNumber || x.contractId === i.contractId) ?? null;
    const shipment = store.shipments.find((s) => s.contractId === i.contractId) ?? null;
    const supplier = store.suppliers.find((s) => s.id === i.supplierId) ?? null;
    const existingPayment = store.payments.find((p) => p.invoiceId === i.id) ?? null;
    const preparation = evaluatePaymentPreparation({
      invoice: i,
      po,
      delivery: deliveryFor(po, shipment),
      supplier,
      payments: store.payments,
      invoices: store.invoices,
    });
    return { invoice: i, duplicates: dupes, po, supplier, existingPayment, preparation };
  });

  const committed = store.purchaseOrders.filter((p) => p.status === "accepted").reduce((s, p) => s + p.amount, 0);
  const released = store.payments.filter((p) => ["released", "confirmed"].includes(p.state)).reduce((s, p) => s + p.amount, 0);

  return {
    rows,
    invoices,
    position: {
      cash: store.settings.startingCash,
      facility: store.settings.approvedFacility,
      committed,
      released,
      contingent: store.purchaseOrders.filter((p) => p.status === "held").reduce((s, p) => s + p.amount, 0),
      headroom: store.settings.startingCash + store.settings.approvedFacility - committed,
    },
  };
}

export function buildCommsView(store) {
  return store.communications.map((m) => {
    if (m.direction === "inbound") {
      const scan = scanInbound(m.body, { sourceType: "email" });
      return { message: m, direction: "inbound", scan, decision: scan.quarantined ? "quarantined" : "safe" };
    }
    const supplier = store.suppliers.find((s) => s.id === m.supplierId);
    const evaluation = evaluateOutbound(m, {
      recipientVerified: m.recipientVerified,
      templateApproved: m.templateApproved,
      idempotencyKeyUsed: false,
      recipientClearedForFinancial: false,
    });
    return { message: m, direction: "outbound", supplier, evaluation, decision: evaluation.decision };
  });
}

export function buildComplianceView(store, now = new Date()) {
  const screenings = store.screenings.map((s) => ({
    ...s,
    live: screenParty({ legalName: s.party, country: s.country }),
  }));
  const conflicts = store.conflicts.map((c) => ({ ...c, opportunity: store.opportunities.find((o) => o.id === c.opportunityId) }));
  const countries = store.countries.map((c) => scoreCountry(c, now)).sort((a, b) => b.score - a.score);
  const documents = store.documents.map((d) => ({ doc: d, freshness: freshness(d, d.class, now) }));
  const identity = detectIdentityConflicts(store.legalEntity, store.documents);
  const partnerDocs = store.documents
    .filter((d) => d.performingEntityId)
    .map((d) => ({ doc: d, attribution: attributionCheck(d, store.legalEntity.id) }));

  return { screenings, conflicts, countries, documents, identity, partnerDocs, now };
}

/** Which actor is acting, and what they may do (page 27, 81). */
export function actorCapabilities(store, actor) {
  const actions = [
    "bid.submit",
    "po.issue",
    "payment.prepare",
    "payment.release",
    "supplier.advance",
    "supplier.promote.S1",
    "supplier.promote.S2",
    "supplier.promote.S3",
    "beneficiary.change",
    "contract.sign",
    "margin.exception",
    "supplier.rfq",
  ];
  return actions.map((a) => ({ action: a, ...authorize(a, actor.role) }));
}
