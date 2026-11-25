/**
 * Three-way matching and accounts-payable controls.
 *
 * Spec pages 31, 86. What Waide ordered, what the supplier invoiced and what was
 * actually delivered must agree inside approved tolerances before any payment.
 */

export const DEFAULT_TOLERANCES = {
  amountPct: 0.5,
  amountAbsolute: 50,
  quantityPct: 0,
  pricePct: 0.1,
};

/**
 * @param {{po:object, invoice:object, delivery?:object, tolerances?:object}} input
 */
export function threeWayMatch(input) {
  const tol = { ...DEFAULT_TOLERANCES, ...(input.tolerances ?? {}) };
  const { po, invoice, delivery } = input;
  const exceptions = [];
  const add = (code, severity, message, detail) => exceptions.push({ code, severity, message, detail });

  if (!po) add("missing_po", "critical", "No purchase order on record: invoice cannot be matched to an obligation.");
  if (!invoice) add("missing_invoice", "critical", "No supplier invoice supplied.");

  if (po && invoice) {
    if (invoice.poNumber !== po.poNumber) {
      add("po_mismatch", "critical", `Invoice references PO ${invoice.poNumber ?? "none"} but the purchase order is ${po.poNumber}.`);
    }

    const amountDelta = Math.abs(num(invoice.amount) - num(po.amount));
    const allowed = Math.max(num(po.amount) * (tol.amountPct / 100), tol.amountAbsolute);
    if (amountDelta > allowed) {
      add("amount_variance", "critical", `Invoice amount differs from PO by ${money(amountDelta)} (tolerance ${money(allowed)}).`);
    }

    if (invoice.currency !== po.currency) {
      add("currency_mismatch", "critical", `Invoice currency ${invoice.currency} does not match PO currency ${po.currency}.`);
    }
    if (invoice.beneficiaryName && po.beneficiaryName && !sameEntity(invoice.beneficiaryName, po.beneficiaryName)) {
      add("beneficiary_change", "critical", "Beneficiary on the invoice differs from the verified PO beneficiary - payment diversion risk.");
    }
    if (invoice.taxAmount !== undefined && po.taxAmount !== undefined && num(invoice.taxAmount) !== num(po.taxAmount)) {
      add("tax_mismatch", "high", "Tax amount on the invoice does not match the PO tax treatment.");
    }
    if (invoice.splitOfInvoice) {
      add("split_invoice", "high", `Invoice is a split of ${invoice.splitOfInvoice}; verify it is not a duplicate claim.`);
    }
  }

  if (po && delivery) {
    const qtyOrdered = num(po.quantity);
    const qtyDelivered = num(delivery.quantityAccepted ?? delivery.quantity);
    if (qtyOrdered !== qtyDelivered) {
      const pct = qtyOrdered ? Math.abs((qtyDelivered - qtyOrdered) / qtyOrdered) * 100 : 100;
      add(
        "quantity_mismatch",
        "critical",
        `Quantity delivered/accepted ${qtyDelivered} vs ordered ${qtyOrdered} (${pct.toFixed(1)}% variance).`,
      );
    }
    if (delivery.poNumber && delivery.poNumber !== po.poNumber) {
      add("delivery_po_mismatch", "critical", "Delivery evidence references a different purchase order.");
    }
    if (!delivery.acceptanceEvidence) {
      add("no_acceptance", "high", "No buyer acceptance or proof-of-delivery evidence attached.");
    }
  }

  if (!delivery) {
    add("no_delivery_evidence", "critical", "No delivery/acceptance evidence: invoice cannot pass three-way match.");
  }

  const critical = exceptions.filter((e) => e.severity === "critical");
  const high = exceptions.filter((e) => e.severity === "high");

  return {
    matched: exceptions.length === 0,
    state: exceptions.length === 0 ? "matched" : critical.length ? "blocked" : "exception_review",
    exceptions,
    requiresHumanResolution: exceptions.length > 0,
    reason:
      exceptions.length === 0
        ? "PO, invoice and delivery/acceptance agree within approved tolerances."
        : `${critical.length} critical and ${high.length} high exception(s); the AI may not resolve them by editing source records.`,
    toleranceUsed: tol,
  };
}

/**
 * Duplicate detection for invoices and payments (page 86).
 */
export function detectDuplicates(candidate, existing = []) {
  const fp = fingerprint(candidate);
  const hits = existing.filter((e) => fingerprint(e) === fp);
  const nearHits = existing.filter(
    (e) =>
      fingerprint(e) !== fp &&
      sameEntity(e.beneficiaryName ?? "", candidate.beneficiaryName ?? "") &&
      Math.abs(num(e.amount) - num(candidate.amount)) <= 0.01 &&
      String(e.invoiceDate ?? "").slice(0, 7) === String(candidate.invoiceDate ?? "").slice(0, 7),
  );
  return {
    duplicate: hits.length > 0 || nearHits.length > 0,
    exactMatches: hits,
    nearMatches: nearHits,
    fingerprint: fp,
    reason:
      hits.length || nearHits.length
        ? "A payment or invoice with the same beneficiary, amount and period already exists - hold and reconcile."
        : "No duplicate found.",
  };
}

export function fingerprint(record) {
  return [
    String(record.beneficiaryName ?? record.supplierId ?? "").toLowerCase().replace(/[^a-z0-9]/g, ""),
    num(record.amount).toFixed(2),
    String(record.currency ?? "").toUpperCase(),
    String(record.invoiceNumber ?? record.paymentReference ?? "").toLowerCase(),
    String(record.invoiceDate ?? record.valueDate ?? "").slice(0, 10),
  ].join("|");
}

/** Beneficiary master-data change control (page 30). */
export function beneficiaryChangeGate(change = {}, now = new Date()) {
  const blockers = [];
  if (!change.independentVerification) blockers.push("No independent verification through a previously established channel.");
  if (!change.verifiedBy) blockers.push("No named verifier recorded.");
  if (change.source === "email_only") blockers.push("An email alone can never change bank details.");
  if (!change.callbackCompleted) blockers.push("Out-of-band callback to a known contact not completed.");
  if (change.toPersonalAccount) blockers.push("Payment to a supplier personal account is blocked by default.");

  const requestedAt = change.requestedAt ? new Date(change.requestedAt) : now;
  const coolingOffHours = 48;
  const readyAt = new Date(requestedAt.getTime() + coolingOffHours * 3600000);
  const coolingOffComplete = now >= readyAt;

  return {
    allowed: blockers.length === 0 && coolingOffComplete,
    blockers,
    coolingOffHours,
    coolingOffComplete,
    effectiveAt: readyAt.toISOString(),
    requiresDualApproval: true,
    reason:
      blockers.length === 0 && coolingOffComplete
        ? "Independent verification complete and cooling-off elapsed; dual approval still required."
        : "Beneficiary change is held pending the listed controls.",
  };
}

function sameEntity(a, b) {
  const n = (v) => String(v).toLowerCase().replace(/\b(ltd|limited|plc|llc|bv|gmbh)\b/g, "").replace(/[^a-z0-9]/g, "");
  return n(a) === n(b);
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function money(v) {
  return `USD ${Math.round(v).toLocaleString("en-US")}`;
}
