"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { loadStore, saveStore, getUser, resetStore } from "@/lib/data/store.mjs";
import { record } from "@/lib/data/store.mjs";
import { authorize, FINANCIAL_LIMITS } from "@/lib/engines/policy.mjs";
import { transition } from "@/lib/engines/workflow.mjs";
import { ACTOR_COOKIE } from "@/lib/session.mjs";
import { evaluateAdmission } from "@/lib/engines/admission.mjs";
import { evaluatePurchaseOrder, approvalExpired } from "@/lib/engines/purchaseOrder.mjs";
import { evaluatePaymentPreparation, evaluatePaymentRelease } from "@/lib/engines/paymentControl.mjs";
import { evaluateBidApproval, evaluateBidSubmission } from "@/lib/engines/bidSubmission.mjs";
import { applyDecision } from "@/lib/engines/approvals.mjs";
import { buildObligationMatrix } from "@/lib/engines/obligations.mjs";
import { threeWayMatch } from "@/lib/engines/match3.mjs";
import { buildOpportunityView } from "@/lib/view.mjs";

async function actorFrom(store: any) {
  const jar = await cookies();
  const id = jar.get(ACTOR_COOKIE)?.value;
  return id ? getUser(store, id) : store.users[0];
}

function fail(returnTo: string, message: string): never {
  const sep = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${sep}error=${encodeURIComponent(message)}`);
}

function nextId(items: any[], prefix: string, width = 5): string {
  const max = items.reduce((highest: number, item: any) => {
    const digits = String(item.id ?? "").replace(/\D/g, "");
    return Math.max(highest, Number(digits) || 0);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(width, "0")}`;
}

function payloadHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function approvedFor(store: any, action: string, subjectId: string, hash?: string) {
  return (
    store.approvals.find(
      (a: any) =>
        a.action === action &&
        a.subjectId === subjectId &&
        a.status === "approved" &&
        !approvalExpired(a) &&
        (!hash || a.payloadHash === hash),
    ) ?? null
  );
}

function ensureApproval(store: any, spec: any) {
  const existing = store.approvals.find(
    (a: any) =>
      a.action === spec.action &&
      a.subjectId === spec.subjectId &&
      !["approved", "rejected", "superseded"].includes(a.status),
  );
  if (existing) {
    /* An approval is bound to the payload it was raised for. If the payload has
       changed, the old approval is void rather than reused: a stale decision must
       never authorise a new amount, quantity or beneficiary. */
    if (spec.payloadHash && existing.payloadHash && existing.payloadHash !== spec.payloadHash) {
      existing.status = "superseded";
      existing.supersededAt = new Date().toISOString();
      existing.supersededReason = "Material payload change; the approval is void.";
    } else {
      return { approval: existing, created: false };
    }
  }
  const approval = {
    id: nextId(store.approvals, "AP", 3),
    action: spec.action,
    subjectId: spec.subjectId,
    subjectLabel: spec.subjectLabel,
    risk: spec.risk ?? "amber",
    status: "pending",
    requestedBy: spec.requestedBy,
    requestedAt: new Date().toISOString(),
    deadline: new Date(Date.now() + FINANCIAL_LIMITS.approvalExpiryHours * 3600000).toISOString(),
    payloadHash: spec.payloadHash,
    evidence: spec.evidence ?? [],
    summary: spec.summary,
    requiredRoles: spec.requiredRoles,
    decisions: [],
    amount: spec.amount ?? 0,
  };
  store.approvals.push(approval);
  return { approval, created: true };
}

export async function setActor(formData: FormData) {
  const jar = await cookies();
  jar.set(ACTOR_COOKIE, String(formData.get("actorId") ?? "u-md"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(String(formData.get("returnTo") ?? "/approvals"));
}

/**
 * Decide an approval. Authority is resolved by the deterministic policy engine:
 * an actor who is not delegated receives a denial that is written to the ledger.
 */
export async function decideApproval(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const id = String(formData.get("approvalId"));
  const decision = String(formData.get("decision"));
  const rationale = String(formData.get("rationale") ?? "").slice(0, 600);
  const returnTo = String(formData.get("returnTo") ?? "/approvals");

  const approval = store.approvals.find((a: any) => a.id === id);
  if (!approval) fail(returnTo, "Approval not found.");

  const auth = authorize(approval.action, actor.role, { amount: approval.amount });

  if (!auth.allowed) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "approval.denied",
      subject: approval.id,
      policyDecision: auth.reasons.join(" "),
      result: `Denied: ${actor.role} may not decide ${approval.action}.`,
    });
    fail(returnTo, auth.reasons[0] ?? "Not authorised.");
  }

  /* Dual control means two distinct authorities, not the same one twice. The
     aggregation rule lives in the engine so it is deterministic and testable. */
  const outcome = applyDecision(approval, { role: actor.role, name: actor.name, decision, rationale });
  if (!outcome.ok) {
    record({
      actor: actor.name,
      actorType: "human",
      action: "approval.denied",
      subject: approval.id,
      policyDecision: `${approval.action} / ${approval.status}`,
      result: `Refused: ${outcome.reason}`,
    });
    saveStore(store);
    fail(returnTo, outcome.reason);
  }
  approval.decisions = outcome.decisions;
  approval.status = outcome.status;
  if (outcome.decidedBy) approval.decidedBy = outcome.decidedBy;
  if (outcome.decidedAt) approval.decidedAt = outcome.decidedAt;
  if (outcome.rationale !== undefined) approval.rationale = outcome.rationale;
  if (outcome.status === "awaiting_second") {
    approval.secondApproverRole = outcome.secondApproverRole;
  } else {
    delete approval.secondApproverRole;
  }

  // When a payment release is authorised, advance the instruction so a separate
  // human can execute it. Approval and execution remain distinct steps.
  if (approval.status === "approved" && approval.action === "payment.release") {
    const payment = store.payments.find((p: any) => p.id === approval.subjectId);
    if (payment && payment.state === "approval_pending") {
      const step = transition("payment", payment.state, "approved");
      if (step.ok) payment.state = "approved";
    }
  }

  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: decision === "reject" ? "approval.rejected" : approval.status === "approved" ? "approval.granted" : "approval.partial",
    subject: approval.id,
    policyDecision: `${approval.action} / ${approval.status}`,
    approval: approval.decidedBy ?? null,
    result: approval.status === "approved" ? "Authority satisfied; action may proceed." : approval.status === "awaiting_second" ? `Awaiting ${approval.secondApproverRole}.` : "Rejected.",
    evidence: approval.evidence?.join("; ") ?? null,
  });

  redirect(returnTo);
}

/** Clear a screening hold with a documented, named resolution. */
export async function resolveScreening(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const id = String(formData.get("screeningId"));
  const outcome = String(formData.get("outcome"));
  const screening = store.screenings.find((s: any) => s.id === id);
  if (!screening) redirect("/compliance");

  if (!["compliance_officer", "managing_director"].includes(actor.role)) {
    record({ actor: actor.name, actorType: "human", action: "screening.resolution.denied", subject: id, policyDecision: "role not delegated", result: "Denied" });
    redirect(`/compliance?error=${encodeURIComponent("Only Compliance or the Managing Director may resolve a screening match.")}`);
  }

  screening.status = outcome;
  screening.resolved = outcome === "false_positive";
  screening.workflowFrozen = outcome === "confirmed_match";
  screening.resolution = {
    by: actor.name,
    at: new Date().toISOString(),
    outcome,
    note: String(formData.get("note") ?? "").slice(0, 500),
  };
  saveStore(store);

  record({
    actor: actor.name,
    actorType: "human",
    action: "screening.resolved",
    subject: id,
    policyDecision: `outcome: ${outcome}`,
    result: screening.resolved ? "Workflow released" : "Workflow remains frozen / rejected",
    evidence: screening.resolution.note || "Documented resolution",
  });

  redirect("/compliance");
}

/**
 * Record supplier admission evidence. A check only counts once it carries a
 * written evidence reference; clearing the field withdraws the evidence.
 */
export async function recordSupplierChecks(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const supplierId = String(formData.get("supplierId"));
  const returnTo = String(formData.get("returnTo") ?? `/suppliers/${supplierId}`);
  const supplier = store.suppliers.find((s: any) => s.id === supplierId);
  if (!supplier) fail(returnTo, "Supplier not found.");

  if (!["compliance_officer", "managing_director"].includes(actor.role)) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "supplier.evidence.denied",
      subject: supplierId,
      policyDecision: "role not delegated",
      result: "Denied: only Compliance or the Managing Director may record admission evidence.",
    });
    fail(returnTo, "Only Compliance or the Managing Director may record admission evidence.");
  }

  let updated = 0;
  for (const check of supplier.checks) {
    const raw = formData.get(`evidence_${check.id}`);
    if (raw === null) continue;
    const evidence = String(raw).trim().slice(0, 500);
    check.evidence = evidence || null;
    check.passed = Boolean(evidence);
    check.note = evidence ? null : "No evidence recorded.";
    check.recordedBy = actor.name;
    check.recordedAt = new Date().toISOString();
    updated += 1;
  }

  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: "supplier.evidence.recorded",
    subject: supplierId,
    policyDecision: `${updated} admission check(s) updated`,
    result: `${supplier.checks.filter((c: any) => c.passed).length}/${supplier.checks.length} checks now evidenced.`,
  });
  redirect(returnTo);
}

/** Promote a supplier only through the deterministic admission gate. */
export async function promoteSupplier(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const supplierId = String(formData.get("supplierId"));
  const target = String(formData.get("target"));
  const returnTo = String(formData.get("returnTo") ?? `/suppliers/${supplierId}`);
  const supplier = store.suppliers.find((s: any) => s.id === supplierId);
  if (!supplier) fail(returnTo, "Supplier not found.");

  const auth = authorize(`supplier.promote.${target}`, actor.role);
  if (!auth.allowed) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "supplier.promotion.denied",
      subject: supplierId,
      policyDecision: auth.reasons.join(" "),
      result: `Denied: ${target} promotion not delegated to ${actor.role}.`,
    });
    fail(returnTo, auth.reasons[0] ?? "Not authorised.");
  }

  const evaluation = evaluateAdmission({ supplier, target, screenings: store.screenings });
  if (!evaluation.allowed) {
    record({
      actor: actor.name,
      actorType: "human",
      action: "supplier.promotion.blocked",
      subject: supplierId,
      policyDecision: evaluation.blockers.join(" "),
      result: `Blocked: ${target} promotion.`,
    });
    fail(returnTo, evaluation.blockers.join(" "));
  }

  const step = transition("supplier", supplier.state, target);
  if (!step.ok) fail(returnTo, step.reason);

  if (auth.mode === "dual") {
    const hash = payloadHash({ supplierId, target, checks: supplier.checks.filter((c: any) => c.passed).map((c: any) => c.id) });
    const approval = approvedFor(store, `supplier.promote.${target}`, supplierId, hash);
    if (!approval) {
      const { approval: created, created: isNew } = ensureApproval(store, {
        action: `supplier.promote.${target}`,
        subjectId: supplierId,
        subjectLabel: `${target} admission - ${supplier.legalName}`,
        risk: "amber",
        requestedBy: actor.id,
        payloadHash: hash,
        requiredRoles: auth.requiredRoles,
        evidence: evaluation.satisfied.map((s: any) => `${s.label}: ${s.evidence}`),
        summary: `Supplier admission to ${target}. ${evaluation.recordedEvidence}/${evaluation.requiredEvidence} requirements evidenced.`,
        amount: 0,
      });
      saveStore(store);
      record({
        actor: actor.name,
        actorType: "human",
        action: "approval.requested",
        subject: created.id,
        policyDecision: `${target} promotion requires ${auth.requiredRoles.join(" + ")}`,
        result: "Dual approval requested before the supplier state changes.",
      });
      fail(returnTo, `Dual approval required for ${target}. ${created.id} was ${isNew ? "created" : "already pending"}; approve it in the Approval centre, then promote again.`);
    }
  }

  supplier.state = target;
  supplier.stateChangedAt = new Date().toISOString();
  supplier.admission = {
    by: actor.name,
    at: supplier.stateChangedAt,
    target,
    evidence: evaluation.satisfied.map((s: any) => `${s.label}: ${s.evidence}`),
  };
  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: "supplier.promoted",
    subject: supplierId,
    policyDecision: `${evaluation.from} -> ${target} (${evaluation.recordedEvidence}/${evaluation.requiredEvidence} requirements)`,
    approval: auth.mode === "dual" ? `dual ${auth.requiredRoles.join(" + ")}` : null,
    result: `${supplier.legalName} is now ${target}.`,
    evidence: evaluation.satisfied.map((s: any) => s.evidence).join("; "),
  });
  redirect(returnTo);
}

/** Issue a purchase order only when supplier, funding, obligations and authority pass. */
export async function issuePurchaseOrder(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const contractId = String(formData.get("contractId"));
  const returnTo = String(formData.get("returnTo") ?? `/contracts/${contractId}`);
  const contract = store.contracts.find((c: any) => c.id === contractId);
  if (!contract) fail(returnTo, "Contract not found.");

  const supplier = store.suppliers.find((s: any) => s.id === contract.supplierId) ?? null;
  const amount = Number(formData.get("amount") ?? contract.value);
  const quantity = Number(formData.get("quantity") ?? 1);
  const unit = String(formData.get("unit") ?? "lot").slice(0, 20);
  const description = String(formData.get("description") ?? contract.title).slice(0, 300);
  const incotermRule = String(formData.get("incotermRule") ?? contract.incoterm?.rule ?? "DAP").toUpperCase();
  const namedPlace = String(formData.get("namedPlace") ?? contract.incoterm?.namedPlace ?? "").slice(0, 120);

  const matrix = buildObligationMatrix(contract.buyerObligations ?? [], contract.supplierObligations ?? []);
  const committed = store.purchaseOrders.filter((p: any) => p.status === "accepted").reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const liquidity = Number(store.settings.startingCash) + Number(store.settings.approvedFacility);
  const hash = payloadHash({ contractId, amount, quantity, supplierId: supplier?.id, incotermRule, namedPlace });
  const approval = approvedFor(store, "po.issue", contractId, hash);

  const gate = evaluatePurchaseOrder({
    contract,
    supplier,
    amount,
    currency: contract.currency,
    actorRole: actor.role,
    existingPos: store.purchaseOrders,
    committed,
    liquidity,
    obligationVerdict: matrix.verdict,
    approval,
    dualThreshold: store.settings.dualApprovalThreshold,
  });

  if (gate.blockers.length) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "po.issue.blocked",
      subject: contractId,
      policyDecision: gate.blockers.join(" "),
      result: "Purchase order refused.",
    });
    fail(returnTo, gate.blockers.join(" "));
  }

  if (gate.requiresApproval && !gate.approvalSatisfied) {
    const { approval: created, created: isNew } = ensureApproval(store, {
      action: "po.issue",
      subjectId: contractId,
      subjectLabel: `Purchase order - ${contract.reference}`,
      risk: amount >= store.settings.dualApprovalThreshold ? "red" : "amber",
      requestedBy: actor.id,
      payloadHash: hash,
      requiredRoles: gate.requiredRoles,
      evidence: [`Supplier ${supplier?.legalName ?? "unknown"} at ${supplier?.state ?? "—"}`, `Value ${contract.currency} ${amount}`, `Obligation coverage ${matrix.verdict}`],
      summary: `Issue PO for ${contract.title}. Requires ${gate.requiredRoles.join(" + ")}.`,
      amount,
    });
    saveStore(store);
    record({
      actor: actor.name,
      actorType: "human",
      action: "approval.requested",
      subject: created.id,
      policyDecision: `po.issue requires ${gate.requiredRoles.join(" + ")}`,
      result: "Purchase order held for approval.",
    });
    fail(returnTo, `Approval required. ${created.id} was ${isNew ? "created" : "already pending"}; approve it, then issue the purchase order again.`);
  }

  const id = nextId(store.purchaseOrders, "PO", 5);
  const po = {
    id,
    poNumber: id,
    contractId,
    supplierId: supplier.id,
    amount,
    currency: contract.currency,
    quantity,
    unit,
    description,
    beneficiaryName: supplier.legalName,
    incoterm: { rule: incotermRule, namedPlace, version: "2020" },
    issuedAt: new Date().toISOString().slice(0, 10),
    acceptedAt: null,
    status: "issued",
    fundingCheck: `Cleared cash + approved facility ${liquidity.toLocaleString()} less committed ${committed.toLocaleString()}`,
    issuedBy: actor.name,
  };
  store.purchaseOrders.push(po);

  if (contract.status === "conditions_pending") contract.status = "active";
  if (contract.status === "active") {
    const step = transition("contract", "active", "fulfilment");
    if (step.ok) contract.status = "fulfilment";
  }

  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: "po.issued",
    subject: id,
    policyDecision: `${gate.auth?.mode ?? "delegated"} / ${gate.requiredRoles.join(" + ") || "delegated role"}`,
    approval: approval?.id ?? null,
    result: `${id} issued to ${supplier.legalName} for ${contract.currency} ${amount.toLocaleString()}.`,
    evidence: `Supplier ${supplier.state}; obligations ${matrix.verdict}; headroom ${liquidity - committed}`,
  });
  redirect(returnTo);
}

/** Prepare a payment instruction from a matched invoice; never release it. */
export async function preparePayment(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const invoiceId = String(formData.get("invoiceId"));
  const returnTo = String(formData.get("returnTo") ?? "/finance");
  const invoice = store.invoices.find((i: any) => i.id === invoiceId);
  if (!invoice) fail(returnTo, "Invoice not found.");

  const po = store.purchaseOrders.find((p: any) => p.poNumber === invoice.poNumber || p.contractId === invoice.contractId) ?? null;
  const shipment = store.shipments.find((s: any) => s.contractId === invoice.contractId) ?? null;
  const delivery = shipment
    ? {
        poNumber: shipment.poNumber,
        quantity: po?.quantity,
        quantityAccepted: shipment.status === "delivered" ? po?.quantity : undefined,
        acceptanceEvidence: shipment.status === "delivered" ? "Proof of delivery / acceptance" : null,
      }
    : null;
  const supplier = store.suppliers.find((s: any) => s.id === invoice.supplierId) ?? null;

  const prep = evaluatePaymentPreparation({ invoice, po, delivery, supplier, payments: store.payments, invoices: store.invoices });
  if (!prep.allowed) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "payment.prepare.blocked",
      subject: invoiceId,
      policyDecision: prep.blockers.join(" "),
      result: "Payment preparation refused.",
    });
    fail(returnTo, prep.blockers.join(" "));
  }

  const auth = authorize("payment.prepare", actor.role, { amount: invoice.amount });
  if (!auth.allowed) fail(returnTo, auth.reasons[0] ?? "Not authorised to prepare a payment.");

  const id = nextId(store.payments, "PAY", 5);
  const hash = payloadHash({ id, amount: invoice.amount, beneficiaryName: invoice.beneficiaryName, invoiceNumber: invoice.invoiceNumber });
  const payment = {
    id,
    reference: id,
    contractId: invoice.contractId,
    invoiceId: invoice.id,
    supplierId: invoice.supplierId,
    amount: invoice.amount,
    currency: invoice.currency,
    beneficiaryName: invoice.beneficiaryName,
    state: "approval_pending",
    preparedBy: actor.id,
    approvedBy: [],
    releasedBy: null,
    valueDate: new Date().toISOString().slice(0, 10),
    threeWayMatch: "matched",
    payloadHash: hash,
    idempotencyKey: `pay:${invoice.contractId}:${invoice.id}`,
  };
  store.payments.push(payment);

  const dual = Number(invoice.amount) >= store.settings.dualApprovalThreshold;
  const requiredRoles = dual ? ["finance_approver", "managing_director"] : ["finance_approver"];
  const { approval, created } = ensureApproval(store, {
    action: "payment.release",
    subjectId: id,
    subjectLabel: `Payment release - ${invoice.invoiceNumber}`,
    risk: dual ? "red" : "amber",
    requestedBy: actor.id,
    payloadHash: hash,
    requiredRoles,
    evidence: [`3-way match ${prep.match?.state ?? "none"}`, `Invoice ${invoice.invoiceNumber}`, `Beneficiary ${invoice.beneficiaryName}`],
    summary: `Release ${invoice.currency} ${Number(invoice.amount).toLocaleString()} to ${invoice.beneficiaryName} for ${invoice.invoiceNumber}.`,
    amount: invoice.amount,
  });

  saveStore(store);
  record({
    actor: actor.name,
    actorType: actor.role === "ai_agent" ? "agent" : "human",
    action: "payment.prepared",
    subject: id,
    policyDecision: `3-way match ${prep.match?.state}; approval ${approval.id} (${requiredRoles.join(" + ")})`,
    result: `${id} prepared for ${invoice.currency} ${Number(invoice.amount).toLocaleString()}; release requires human approval.`,
    evidence: `Invoice ${invoice.invoiceNumber}; PO ${po?.poNumber ?? "none"}`,
  });
  redirect(`${returnTo}?prepared=${encodeURIComponent(id)}&approval=${encodeURIComponent(approval.id)}${created ? "&created=1" : ""}`);
}

/** Release a payment only after an approved, matched instruction exists. */
export async function releasePayment(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const paymentId = String(formData.get("paymentId"));
  const returnTo = String(formData.get("returnTo") ?? "/finance");
  const payment = store.payments.find((p: any) => p.id === paymentId);
  if (!payment) fail(returnTo, "Payment instruction not found.");

  const invoice = store.invoices.find((i: any) => i.id === payment.invoiceId) ?? null;
  const po = store.purchaseOrders.find((p: any) => p.contractId === payment.contractId) ?? null;
  const shipment = store.shipments.find((s: any) => s.contractId === payment.contractId) ?? null;
  const delivery = shipment
    ? {
        poNumber: shipment.poNumber,
        quantity: po?.quantity,
        quantityAccepted: shipment.status === "delivered" ? po?.quantity : undefined,
        acceptanceEvidence: shipment.status === "delivered" ? "Proof of delivery / acceptance" : null,
      }
    : null;
  const match = po ? threeWayMatch({ po, invoice, delivery }) : null;
  const approval = store.approvals.find((a: any) => a.action === "payment.release" && a.subjectId === paymentId) ?? null;

  const gate = evaluatePaymentRelease({
    payment,
    actorRole: actor.role,
    approval,
    match,
    dualThreshold: store.settings.dualApprovalThreshold,
  });
  if (!gate.allowed) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "payment.release.blocked",
      subject: paymentId,
      policyDecision: gate.blockers.join(" "),
      result: "Payment release refused.",
    });
    fail(returnTo, gate.blockers.join(" "));
  }

  if (payment.state === "approval_pending") {
    const step = transition("payment", "approval_pending", "approved");
    if (!step.ok) fail(returnTo, step.reason);
    payment.state = "approved";
  }
  const release = transition("payment", "approved", "released");
  if (!release.ok) fail(returnTo, release.reason);

  payment.state = "released";
  payment.releasedBy = actor.id;
  payment.releasedAt = new Date().toISOString();
  payment.approvedBy = (approval?.decisions ?? []).map((d: any) => d.by);

  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: "payment.released",
    subject: paymentId,
    policyDecision: `${gate.auth?.mode ?? "delegated"} / approval ${approval?.id}`,
    approval: approval?.decidedBy ?? null,
    result: `${payment.reference} released for ${payment.currency} ${Number(payment.amount).toLocaleString()} to ${payment.beneficiaryName}.`,
    evidence: `3-way match ${match?.state ?? "none"}; approval ${approval?.id}`,
  });
  redirect(returnTo);
}

/** Approve a bid for submission only when every deterministic gate passes. */
export async function approveBid(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const opportunityId = String(formData.get("opportunityId"));
  const returnTo = String(formData.get("returnTo") ?? `/opportunities/${opportunityId}`);
  const opp = store.opportunities.find((o: any) => o.id === opportunityId);
  if (!opp) fail(returnTo, "Opportunity not found.");

  const view = buildOpportunityView(store, opp, new Date(), actor);
  const gate = evaluateBidApproval({
    opportunity: opp,
    gate: view.gate,
    margin: view.margin,
    cash: view.cash,
    deadline: view.deadline,
    actorRole: actor.role,
    marginException: view.marginException,
  });

  if (!gate.allowed) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "bid.approval.blocked",
      subject: opportunityId,
      policyDecision: gate.blockers.join(" "),
      result: "Bid approval refused.",
    });
    fail(returnTo, gate.blockers.join(" "));
  }

  const step = transition("opportunity", opp.stage, "bid_approved");
  if (!step.ok) fail(returnTo, step.reason);

  opp.stage = "bid_approved";
  opp.bidApprovedAt = new Date().toISOString();
  opp.bidApprovedBy = actor.name;

  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: "bid.approved",
    subject: opportunityId,
    policyDecision: `gate ${view.gate.verdict}; margin ${view.margin?.decision ?? "n/a"}`,
    approval: actor.name,
    result: "Bid approved for submission; portal receipt still required.",
    evidence: `Gate ${view.gate.verdict}; contribution ${view.margin?.contributionPct ?? "—"}%`,
  });
  redirect(returnTo);
}

/** Record a bid submission only with an official portal receipt. */
export async function submitBid(formData: FormData) {
  const store = loadStore();
  const actor = await actorFrom(store);
  const opportunityId = String(formData.get("opportunityId"));
  const returnTo = String(formData.get("returnTo") ?? `/opportunities/${opportunityId}`);
  const opp = store.opportunities.find((o: any) => o.id === opportunityId);
  if (!opp) fail(returnTo, "Opportunity not found.");

  const receipt = {
    officialReference: String(formData.get("officialReference") ?? "").trim().slice(0, 200) || undefined,
    portalReceiptUrl: String(formData.get("portalReceiptUrl") ?? "").trim().slice(0, 500) || undefined,
    capturedAt: new Date().toISOString(),
  };

  const gate = evaluateBidSubmission({ opportunity: opp, receipt, actorRole: actor.role });
  if (!gate.allowed) {
    record({
      actor: actor.name,
      actorType: actor.role === "ai_agent" ? "agent" : "human",
      action: "bid.submission.blocked",
      subject: opportunityId,
      policyDecision: gate.blockers.join(" "),
      result: "Bid submission refused.",
    });
    fail(returnTo, gate.blockers.join(" "));
  }

  const step = transition("opportunity", opp.stage, "submitted");
  if (!step.ok) fail(returnTo, step.reason);

  opp.stage = "submitted";
  opp.submission = receipt;
  opp.submittedAt = receipt.capturedAt;
  opp.submittedBy = actor.name;

  saveStore(store);
  record({
    actor: actor.name,
    actorType: "human",
    action: "bid.submitted",
    subject: opportunityId,
    policyDecision: "receipt captured",
    result: `Bid submitted; reference ${receipt.officialReference ?? receipt.portalReceiptUrl}.`,
    evidence: receipt.officialReference ?? receipt.portalReceiptUrl ?? null,
  });
  redirect(returnTo);
}

export async function resetDataset() {
  resetStore();
  redirect("/");
}
