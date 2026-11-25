/**
 * Time-phased cash model.
 *
 * Spec pages 22, 33, 64. A profitable contract can still bankrupt an
 * asset-light contractor: peak funding need is modelled per stage, not netted
 * against total contract profit.
 *
 *   peak cash requirement = max cumulative outflows - cumulative cleared inflows
 */

const FUNDING_CLASSES = {
  cleared: { rank: 3, label: "Cleared cash", usable: true },
  committed_facility: { rank: 2, label: "Committed facility", usable: true },
  expected: { rank: 1, label: "Expected receipt", usable: false },
  uncommitted: { rank: 0, label: "Uncommitted buyer promise", usable: false },
};

/**
 * @param {Array<{date:string, direction:"out"|"in", amount:number, label:string, fundingClass?:string}>} events
 * @param {{startingCash?:number, approvedFacility?:number}} [opts]
 */
export function buildCashCurve(events, opts = {}) {
  const startingCash = num(opts.startingCash);
  const approvedFacility = num(opts.approvedFacility);
  const sorted = [...events].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  let cumOut = 0;
  let cumClearedIn = 0;
  let cumAllIn = 0;
  const points = [];

  for (const e of sorted) {
    const cls = FUNDING_CLASSES[e.fundingClass ?? (e.direction === "out" ? "committed_facility" : "expected")];
    const amount = num(e.amount);
    if (e.direction === "out") {
      cumOut += amount;
    } else {
      cumAllIn += amount;
      if (cls?.usable) cumClearedIn += amount;
    }
    points.push({
      date: e.date,
      label: e.label,
      direction: e.direction,
      amount,
      fundingClass: e.fundingClass ?? (e.direction === "out" ? "committed_facility" : "expected"),
      fundingClassLabel: cls?.label ?? "Unclassified",
      cumOutflow: round(cumOut),
      cumUsableInflow: round(cumClearedIn),
      cumAllInflow: round(cumAllIn),
      netUseOfCash: round(cumOut - cumClearedIn),
      cashPosition: round(startingCash + cumClearedIn - cumOut),
    });
  }

  // Peak funding need is the maximum net use of cash at any point in time.
  let peak = 0;
  let peakAt = null;
  for (const p of points) {
    if (p.netUseOfCash > peak) {
      peak = p.netUseOfCash;
      peakAt = p.date;
    }
  }

  const liquidity = round(startingCash + approvedFacility);
  const headroom = round(liquidity - peak);

  return {
    points,
    peakCashRequirement: round(peak),
    peakAt,
    liquidityAvailable: liquidity,
    headroom,
    funded: headroom >= 0,
    verdict: headroom >= 0 ? "fundable" : "cash_gap",
    blockingReason:
      headroom >= 0
        ? null
        : `Peak funding need of ${money(peak)} exceeds approved liquidity of ${money(liquidity)} - no bid recommendation.`,
    fundingMix: summariseMix(points),
  };
}

function summariseMix(points) {
  const mix = {};
  for (const p of points) {
    if (p.direction !== "in") continue;
    const key = p.fundingClass;
    mix[key] = round((mix[key] ?? 0) + p.amount);
  }
  return mix;
}

/**
 * Stress the same contract under downside assumptions (page 22).
 */
export function stressScenarios(events, opts = {}) {
  const base = buildCashCurve(events, opts);
  const delay = num(opts.buyerDelayDays ?? 45);
  const delayed = buildCashCurve(
    events.map((e) => (e.direction === "in" ? { ...e, date: addDays(e.date, delay) } : e)),
    opts,
  );
  const costShock = buildCashCurve(
    events.map((e) => (e.direction === "out" ? { ...e, amount: num(e.amount) * 1.08 } : e)),
    opts,
  );
  const fxShock = buildCashCurve(
    events.map((e) => (e.direction === "in" ? { ...e, amount: num(e.amount) * 0.94 } : e)),
    opts,
  );

  return [
    { id: "base", label: "Base case", ...pick(base) },
    { id: "buyer_delay", label: `Buyer pays ${delay} days late`, ...pick(delayed) },
    { id: "cost_shock", label: "Direct costs +8%", ...pick(costShock) },
    { id: "fx_shock", label: "FX adverse 6% on receipts", ...pick(fxShock) },
  ];
}

function pick(r) {
  return {
    peakCashRequirement: r.peakCashRequirement,
    headroom: r.headroom,
    funded: r.funded,
    verdict: r.verdict,
    blockingReason: r.blockingReason,
  };
}

/** Which funding instruments may legitimately back a supplier advance (page 22). */
export function advanceFundingCheck(instrument = {}) {
  const allowed = ["cleared_buyer_advance", "confirmed_irrevocable_lc", "committed_trade_facility", "escrow", "board_approved_instrument"];
  const reasons = [];
  if (!allowed.includes(instrument.type)) {
    reasons.push(`Funding instrument "${instrument.type ?? "none"}" is not an approved source for a supplier advance.`);
  }
  if (instrument.status !== "confirmed" && instrument.status !== "cleared") {
    reasons.push("Instrument is not yet confirmed/cleared; a draft, expected or unconfirmed instrument cannot back a payment.");
  }
  if (!instrument.issuer) reasons.push("Instrument issuer is not recorded.");
  if (!instrument.expiry) reasons.push("Instrument expiry is not recorded.");
  if (instrument.buyerPromiseOnly) reasons.push("A buyer promise to pay is not cleared cash or irrevocably available funding.");
  return { allowed: reasons.length === 0, reasons, requiresHumanApproval: true };
}

export function addDays(iso, days) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + Number(days));
  return d.toISOString().slice(0, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function round(v, dp = 2) {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}
function money(v) {
  return `USD ${Math.round(v).toLocaleString("en-US")}`;
}
