/**
 * Country intelligence scoring and jurisdictional chain.
 *
 * Spec pages 6, 7, 37. The score is a prioritisation signal that can never
 * override a legal prohibition, sanctions restriction, missing permit or an
 * unmanageable payment restriction.
 */

export const COUNTRY_WEIGHTS = {
  opportunityVolume: 20,
  legalEligibility: 20,
  buyerPayment: 15,
  supplierLogistics: 15,
  productRegulatory: 10,
  fxBanking: 10,
  politicalSanctions: 5,
  localPartner: 5,
};

export const FACTOR_LABELS = {
  opportunityVolume: "Opportunity volume & relevance",
  legalEligibility: "Waide legal eligibility",
  buyerPayment: "Buyer payment reliability",
  supplierLogistics: "Supplier & logistics feasibility",
  productRegulatory: "Product regulatory requirements",
  fxBanking: "Currency & banking exposure",
  politicalSanctions: "Political, security & sanctions risk",
  localPartner: "Local partner & after-sales capability",
};

/**
 * @param {{code:string,name:string,tier:number,factors:Record<string,number|undefined>,hardStops?:Array<{code:string,label:string}>,lastRefresh?:string}} profile
 */
export function scoreCountry(profile, now = new Date()) {
  let score = 0;
  let answeredWeight = 0;
  const components = [];
  const missing = [];

  for (const [key, weight] of Object.entries(COUNTRY_WEIGHTS)) {
    const raw = profile.factors?.[key];
    if (raw === undefined || raw === null) {
      missing.push({ key, label: FACTOR_LABELS[key], weight });
      components.push({ key, label: FACTOR_LABELS[key], weight, value: null, contribution: null, status: "missing" });
      continue;
    }
    const value = clamp(Number(raw), 0, 100);
    answeredWeight += weight;
    const contribution = round((value / 100) * weight);
    score += contribution;
    components.push({ key, label: FACTOR_LABELS[key], weight, value, contribution, status: value < 45 ? "weak" : "ok" });
  }

  // Missing factors reduce coverage rather than silently defaulting to neutral.
  const coverage = round((answeredWeight / 100) * 100);
  const confidence = coverage === 100 ? "high" : coverage >= 75 ? "medium" : "low";

  const band = scoreBand(score);
  const hardStops = profile.hardStops ?? [];
  const blocked = hardStops.length > 0;

  const ageDays = profile.lastRefresh
    ? Math.floor((now.getTime() - new Date(profile.lastRefresh).getTime()) / 86400000)
    : null;
  const stale = ageDays === null || ageDays > 90;

  return {
    code: profile.code,
    name: profile.name,
    tier: profile.tier,
    score: round(score),
    coverage,
    confidence,
    band,
    blocked,
    hardStops,
    components,
    missing,
    stale,
    ageDays,
    lastRefresh: profile.lastRefresh ?? null,
    decision: blocked ? "hard_stop" : stale && band.id === "active" ? "review_stale" : band.id,
    decisionLabel: blocked ? "Blocked by legal prohibition" : stale && band.id === "active" ? "Active target - score stale, refresh required" : band.label,
  };
}

export function scoreBand(score) {
  if (score >= 75) return { id: "active", label: "Active target", action: "Pursue actively" };
  if (score >= 60) return { id: "selective", label: "Pursue selectively", action: "Pursue only fit opportunities" };
  if (score >= 45) return { id: "monitor", label: "Monitor + diligence", action: "Additional diligence before bidding" };
  return { id: "no_auto_bid", label: "Do not bid automatically", action: "Human decision required" };
}

/**
 * Jurisdictional chain: the countries and regimes implicated by one transaction.
 * @param {object} chain
 */
export function jurisdictionMap(chain = {}) {
  const nodes = [
    { key: "incorporation", label: "Waide incorporation", country: chain.incorporation ?? "NG" },
    { key: "buyer", label: "Buyer country", country: chain.buyer },
    { key: "manufacturer", label: "Manufacturer country", country: chain.manufacturer },
    { key: "origin", label: "Shipping origin", country: chain.origin },
    { key: "destination", label: "Final destination", country: chain.destination },
  ];
  for (const [i, c] of (chain.transit ?? []).entries()) {
    nodes.push({ key: `transit_${i}`, label: `Transit ${i + 1}`, country: c });
  }

  const controls = [];
  if (chain.usOriginTechnology) {
    controls.push({ regime: "US export controls (EAR/ITAR)", jurisdiction: "US", why: "US-origin technology or components are in scope." });
  }
  if (chain.euMedicalDevice) {
    controls.push({ regime: "EU MDR / CE scope", jurisdiction: "EU", why: "European medical device conformity is asserted." });
  }
  if (chain.ifinanced) {
    controls.push({ regime: "Development-bank procurement rules", jurisdiction: "Lender", why: "Project is internationally financed; lender rules bind the award." });
  }
  if (chain.crossBorderPayment) {
    controls.push({ regime: "Sanctions & correspondent banking rules", jurisdiction: "Multiple", why: "Cross-border payment route passes through correspondent banks." });
  }

  const unresolved = [];
  for (const n of nodes) if (!n.country) unresolved.push(`${n.label} jurisdiction unidentified`);

  return {
    nodes,
    controls,
    unresolved,
    verdict: unresolved.length ? "incomplete" : "complete",
    blockingReason: unresolved.length ? "No bid or shipment is cleared while a material jurisdiction is unidentified." : null,
  };
}

/**
 * Source authority hierarchy (page 37). A Level 6 source can never prove eligibility.
 */
export const SOURCE_LEVELS = {
  1: { label: "Legislation, regulators, official procurement documents", usableFor: ["legal", "tender", "compliance"] },
  2: { label: "Official buyer & manufacturer publications", usableFor: ["compliance", "technical"] },
  3: { label: "Signed documents & verified communications", usableFor: ["commercial"] },
  4: { label: "Official registries & certification bodies", usableFor: ["identity", "certification"] },
  5: { label: "Established commercial databases", usableFor: ["research", "corroboration"] },
  6: { label: "Aggregators, search results, social media", usableFor: ["discovery"] },
};

export function assertSourceUsable(level, purpose) {
  const src = SOURCE_LEVELS[level];
  if (!src) return { usable: false, reason: `Unknown source level ${level}.` };
  const usable = src.usableFor.includes(purpose);
  return {
    usable,
    level,
    reason: usable
      ? `Level ${level} source is authoritative for ${purpose}.`
      : `Level ${level} source (${src.label}) may not be used as evidence for ${purpose}${level === 6 ? "; a search result is never proof of eligibility" : ""}.`,
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
function round(v, dp = 2) {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}
