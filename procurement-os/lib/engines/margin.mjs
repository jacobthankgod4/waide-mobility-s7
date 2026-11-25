/**
 * Contribution-margin engine.
 *
 * Spec pages 19, 20, 54, 86. Profit is NOT buyer price minus supplier price.
 * All direct transaction costs are subtracted, unknown costs block a final price,
 * and the result is compared against sector target / floor bands.
 */

/** Proposed Waide starting thresholds - company policy, not industry averages. */
export const SECTOR_MARGINS = {
  A1: { code: "A1", label: "Geospatial, GIS & digital twins", targetMin: 30, targetMax: 40, floor: 25 },
  A2: { code: "A2", label: "Medical supplies & consumables", targetMin: 18, targetMax: 25, floor: 15 },
  A3: { code: "A3", label: "Mobility & orthopaedic equipment", targetMin: 20, targetMax: 28, floor: 17 },
  A4: { code: "A4", label: "Mining equipment, spares & safety", targetMin: 18, targetMax: 25, floor: 15 },
  A4S: { code: "A4S", label: "Mining safety equipment", targetMin: 20, targetMax: 28, floor: 17 },
  B1: { code: "B1", label: "Construction & infrastructure supply", targetMin: 20, targetMax: 28, floor: 18 },
  B2: { code: "B2", label: "Hospitality technology", targetMin: 25, targetMax: 40, floor: 20 },
  B3: { code: "B3", label: "Tourism technology", targetMin: 25, targetMax: 40, floor: 20 },
  C: { code: "C", label: "Restricted / excluded categories", targetMin: null, targetMax: null, floor: 100, excluded: true },
};

export const GLOBAL_FLOOR = 15;

/** Minimum cost lines a complete model must carry (page 19). */
export const REQUIRED_COST_KEYS = [
  "supplier_price",
  "freight",
  "cargo_insurance",
  "customs_duties",
  "inspection",
  "banking_fx",
  "financing",
  "bid_security",
  "delivery_install",
  "warranty_provision",
  "subcontractors",
  "contingency",
];

/**
 * @param {object} bid priced bid model
 * @param {object} sector sector margin rule
 * @param {object} [opts]
 */
export function calculateContribution(bid, sector, opts = {}) {
  const revenue = num(bid.revenue);
  const costs = Array.isArray(bid.costs) ? bid.costs : [];

  const unknown = costs.filter((c) => c.certainty === "unknown" || c.amount === null || c.amount === undefined);
  const priced = costs.filter((c) => !unknown.includes(c));
  const directCosts = round(priced.reduce((s, c) => s + num(c.amount), 0));

  // A cost line that is missing entirely is as dangerous as one marked unknown.
  const presentKeys = new Set(costs.map((c) => c.key));
  const missingKeys = REQUIRED_COST_KEYS.filter((k) => !presentKeys.has(k) && k !== "financing" && k !== "contingency");

  const contingencyPct = num(bid.contingencyPct);
  const contingencyAmount = round(((directCosts + num(bid.financingCost)) * contingencyPct) / 100);
  const totalCost = round(directCosts + num(bid.financingCost) + contingencyAmount);
  const contribution = round(revenue - totalCost);
  const contributionPct = revenue > 0 ? round((contribution / revenue) * 100, 2) : 0;

  const effectiveFloor = Math.max(num(sector?.floor ?? GLOBAL_FLOOR), opts.floorOverride ?? 0);
  const targetMin = sector?.targetMin ?? 30;

  const exclusions = [];
  if (sector?.excluded) {
    exclusions.push(`${sector.label} is excluded from autonomous trading at launch (WAOC sector policy C).`);
  }
  if (num(bid.unpricedLiability) > 0) {
    exclusions.push("Unpriced liability / uncapped exposure is present - no automatic bid approval.");
  }

  let decision = "eligible";
  let rationale = "Contribution is at or above the sector target floor.";

  if (exclusions.length) {
    decision = "blocked";
    rationale = exclusions[0];
  } else if (unknown.length || missingKeys.length) {
    decision = "no_final_price";
    rationale = "Unknown or missing direct cost: no final price may be issued.";
  } else if (contribution <= 0) {
    decision = "reject_negative";
    rationale = "Negative or zero contribution is an absolute bid rejection.";
  } else if (contributionPct < effectiveFloor) {
    decision = "below_floor";
    rationale = `Contribution ${contributionPct}% is below the ${effectiveFloor}% sector floor; do not submit automatically.`;
  } else if (contributionPct < targetMin) {
    decision = "pricing_review";
    rationale = `Contribution ${contributionPct}% is between floor and target (${targetMin}%); competitive-pricing review required.`;
  }

  return {
    revenue,
    directCosts,
    financingCost: round(num(bid.financingCost)),
    contingencyPct,
    contingencyAmount,
    totalCost,
    contribution,
    contributionPct,
    // A percentage computed while a direct cost is unknown is indicative only and
    // must never be presented or approved as a final price (page 19).
    provisional: unknown.length > 0 || missingKeys.length > 0,
    grossMarkupPct: totalCost > 0 ? round(((revenue - totalCost) / totalCost) * 100, 2) : 0,
    sectorFloor: effectiveFloor,
    sectorTargetMin: targetMin,
    targetMax: sector?.targetMax ?? null,
    decision,
    rationale,
    unknownCosts: unknown.map((c) => c.label || c.key),
    missingCostLines: missingKeys,
    costLines: costs.map((c) => ({
      ...c,
      nineLineShare: revenue > 0 ? round((num(c.amount) / revenue) * 100, 2) : 0,
    })),
  };
}

/**
 * Risk-adjust a margin for payment timing, FX and buyer confidence (page 20).
 * 12% with prepayment is not 12% with a 120-day receivable.
 */
export function riskAdjustedMargin(input) {
  const {
    contributionPct,
    revenue,
    buyerAdvancePct = 0,
    receivableDays = 0,
    supplierDepositPct = 0,
    costOfCapitalPct = 14,
    fxExposurePct = 0,
    paymentConfidence = "high",
  } = input;

  const unfunded = Math.max(0, 1 - num(buyerAdvancePct) / 100);
  const carryDays = num(receivableDays) + (num(supplierDepositPct) > 0 ? 30 : 0);
  const fundingCostPct = (unfunded * carryDays * num(costOfCapitalPct)) / 365;
  const fxDrag = (num(fxExposurePct) * 0.35) / 100;
  const confidenceDrag =
    { high: 0, medium: 1.5, low: 4, unverified: 6 }[paymentConfidence] ?? 3;

  const adjusted = round(num(contributionPct) - fundingCostPct - fxDrag - confidenceDrag, 2);
  const fundingCostAmount = round((num(revenue) * fundingCostPct) / 100);

  return {
    adjustedContributionPct: adjusted,
    fundingCostPct: round(fundingCostPct, 2),
    fundingCostAmount,
    fxDragPct: round(fxDrag, 2),
    confidenceDragPct: confidenceDrag,
    carryDays,
    verdict:
      adjusted <= 0
        ? "reject_negative"
        : adjusted < GLOBAL_FLOOR
          ? "below_floor_after_risk"
          : "acceptable_after_risk",
  };
}

/** Realised margin at closeout, preserving the bid snapshot separately (page 54). */
export function realisedMargin(bidSnapshot, actuals) {
  const actualCosts = num(actuals.totalCosts);
  const actualRevenue = num(actuals.totalReceived);
  const contribution = round(actualRevenue - actualCosts);
  const pct = actualRevenue > 0 ? round((contribution / actualRevenue) * 100, 2) : 0;
  const bidContribution = num(bidSnapshot.contribution);
  return {
    actualRevenue,
    actualCosts,
    contribution,
    contributionPct: pct,
    bidContribution,
    varianceAmount: round(contribution - bidContribution),
    variancePctPoints: round(pct - num(bidSnapshot.contributionPct), 2),
    bidSnapshotPreserved: true,
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function round(v, dp = 2) {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}
