/**
 * Contract obligation coverage and prohibited-exposure controls.
 *
 * Spec pages 9, 28, 29. Waide must never accept a buyer obligation that no
 * supplier undertaking, insurance policy or priced reserve covers.
 */

/** Default-prohibited commitment types (WAOC page 28 table). */
export const COMMITMENT_POLICY = {
  bid_security: { autonomous: false, label: "Bid security", approval: "MD + Finance" },
  performance_bond: { autonomous: false, label: "Performance bond", approval: "MD + Finance + Legal" },
  advance_payment_guarantee: { autonomous: false, label: "Advance-payment guarantee", approval: "MD + Finance + Legal" },
  parent_company_guarantee: { autonomous: false, label: "Parent-company guarantee", approval: "Legal review" },
  personal_guarantee_director: { autonomous: false, prohibited: true, label: "Personal guarantee by director", approval: "Never" },
  unlimited_indemnity: { autonomous: false, prohibited: true, label: "Unlimited indemnity", approval: "Never" },
  unlimited_liquidated_damages: { autonomous: false, prohibited: true, label: "Unlimited liquidated damages", approval: "Never" },
  uncapped_liability: { autonomous: false, label: "Uncapped liability", approval: "Legal review" },
  joint_and_several_liability: { autonomous: false, label: "Joint & several liability", approval: "Legal review" },
  unbounded_warranty: { autonomous: false, label: "Unbounded product warranty", approval: "Legal review" },
  unfunded_minimum_purchase: { autonomous: false, prohibited: true, label: "Unfunded minimum purchase commitment", approval: "Never" },
  exclusivity_sales_target: { autonomous: false, prohibited: true, label: "Exclusivity with compulsory sales targets", approval: "Never" },
  uninsured_cargo: { autonomous: false, prohibited: true, label: "Uninsured cargo/product exposure", approval: "Never" },
  supplier_obligation_gap: { autonomous: false, label: "Buyer obligation not passed through", approval: "Pricing + Legal" },
};

/**
 * Build the clause-by-clause coverage matrix.
 * @param {Array} buyerObligations [{id, clause, category, text, cappedAmount?, unlimited?, insurance?}]
 * @param {Array} supplierObligations
 */
export function buildObligationMatrix(buyerObligations = [], supplierObligations = []) {
  const rows = buyerObligations.map((buyer) => {
    const backing = supplierObligations.filter((s) => s.category === buyer.category || s.covers?.includes(buyer.id));
    const strongest = backing.sort((a, b) => (b.cappedAmount ?? Infinity) - (a.cappedAmount ?? Infinity))[0];

    const buyerCapped = !buyer.unlimited && buyer.cappedAmount !== undefined && buyer.cappedAmount !== null;
    const supplierCapped = strongest ? !strongest.unlimited && strongest.cappedAmount != null : false;

    let status = "covered";
    let exposure = 0;
    let note = "Buyer obligation is backed by an equivalent supplier undertaking.";

    if (buyer.unlimited) {
      // Uncapped buyer exposure dominates: it cannot be neutralised by any
      // supplier undertaking, whether or not one exists (page 28).
      status = "unlimited_buyer_exposure";
      exposure = Infinity;
      note = "Buyer obligation is unlimited; no supplier undertaking can neutralise an uncapped buyer liability.";
    } else if (!strongest) {
      status = "uncovered";
      exposure = Number(buyer.cappedAmount ?? 0);
      note = "No supplier undertaking covers this obligation - Waide would carry it alone.";
    } else if (buyerCapped && supplierCapped && Number(strongest.cappedAmount) < Number(buyer.cappedAmount)) {
      status = "partially_covered";
      exposure = Number(buyer.cappedAmount) - Number(strongest.cappedAmount);
      note = `Supplier cap ${money(strongest.cappedAmount)} is below buyer cap ${money(buyer.cappedAmount)}.`;
    } else if (buyer.insurance && !strongest.insurance) {
      status = "insurance_gap";
      exposure = Number(buyer.cappedAmount ?? 0);
      note = "Buyer requires insurance cover that the supplier undertaking does not carry.";
    }

    return {
      id: buyer.id,
      clause: buyer.clause,
      category: buyer.category,
      buyerText: buyer.text,
      supplierClause: strongest?.clause ?? null,
      supplierText: strongest?.text ?? null,
      status,
      exposure: Number.isFinite(exposure) ? exposure : "unlimited",
      pricedReserve: Number(buyer.reserve ?? 0),
      note,
      mitigationOwner: status === "covered" ? "Supplier" : "Waide commercial / legal",
      requiresApproval: status !== "covered",
    };
  });

  const uncovered = rows.filter((r) => r.status !== "covered");
  const unlimited = rows.filter((r) => r.exposure === "unlimited");
  const unpriced = uncovered.filter((r) => r.pricedReserve === 0);

  return {
    rows,
    coveredCount: rows.length - uncovered.length,
    uncoveredCount: uncovered.length,
    unlimitedCount: unlimited.length,
    unpricedExposureCount: unpriced.length,
    totalPricedReserve: rows.reduce((s, r) => s + Number(r.pricedReserve || 0), 0),
    verdict:
      unlimited.length > 0
        ? "reject_or_legal_review"
        : unpriced.length > 0
          ? "pricing_required"
          : uncovered.length > 0
            ? "approval_required"
            : "back_to_back",
    blockingReason:
      unlimited.length > 0
        ? "Uncapped buyer liability exists that cannot be passed through; bid is not ready without legal review."
        : unpriced.length > 0
          ? `${unpriced.length} uncovered obligation(s) carry no priced reserve - no automatic bid approval.`
          : null,
  };
}

/** Commitment-type admissibility check. */
export function commitmentDecision(type) {
  const rule = COMMITMENT_POLICY[type];
  if (!rule) return { allowed: false, prohibited: true, reason: `Unknown commitment type "${type}" - fail closed.` };
  if (rule.prohibited) return { allowed: false, prohibited: true, reason: `${rule.label} is prohibited by WAOC policy.`, approval: rule.approval };
  return {
    allowed: true,
    autonomous: false,
    prohibited: false,
    reason: `${rule.label} may only be issued with ${rule.approval} approval and a costed security instrument.`,
    approval: rule.approval,
  };
}

/**
 * Consortium / JV exposure analysis (page 29).
 */
export function analyseConsortium(member = {}) {
  const findings = [];
  if (member.jointAndSeveral) {
    findings.push({
      severity: "critical",
      message: `Joint and several liability exposes Waide to the entire ${money(member.contractValue ?? 0)} contract, not just its ${member.worksharePct ?? "?"}% workshare.`,
    });
  }
  if (member.relianceOnMemberFinancials && !member.tenderPermitsReliance) {
    findings.push({ severity: "critical", message: "Member financial capacity cannot be relied on unless the solicitation expressly permits it." });
  }
  if (member.relianceOnManufacturerExperience && !member.tenderPermitsManufacturerExperience) {
    findings.push({ severity: "critical", message: "Manufacturer past performance cannot be aggregated without explicit tender permission." });
  }
  if (member.leadMemberThresholdsUnchecked) {
    findings.push({ severity: "high", message: "Lead-member thresholds and member-level requirements have not been checked clause by clause." });
  }
  return {
    findings,
    verdict: findings.some((f) => f.severity === "critical") ? "legal_review_required" : findings.length ? "review" : "clear",
    requiresLegalReview: findings.length > 0,
  };
}

function money(v) {
  return `USD ${Math.round(Number(v) || 0).toLocaleString("en-US")}`;
}
