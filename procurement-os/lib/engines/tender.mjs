/**
 * Tender document intelligence primitives.
 *
 * Spec pages 38, 39, 40, 46, 83. Deadlines keep their timezone, amendments are
 * versioned and diffed, duplicates are detected, and OCR numbers require an
 * independent second extraction before they can be relied on.
 */

/** Resolve a local-time deadline with an explicit IANA zone to UTC. */
export function resolveDeadline(deadline, timeZone = "UTC", now = new Date()) {
  if (!deadline) return { valid: false, reason: "No deadline recorded." };

  let utc;
  if (/Z$|[+-]\d{2}:\d{2}$/.test(String(deadline))) {
    utc = new Date(deadline);
  } else {
    // Interpret the wall-clock time in the tender's own timezone.
    const [datePart, timePart = "23:59"] = String(deadline).split(/[T ]/);
    const utcGuess = new Date(`${datePart}T${timePart}:00Z`);
    const tzOffsetMinutes = -getZoneOffsetMinutes(utcGuess, timeZone);
    utc = new Date(utcGuess.getTime() + tzOffsetMinutes * 60000);
  }

  if (Number.isNaN(utc.getTime())) return { valid: false, reason: `Unparseable deadline "${deadline}".` };

  const msRemaining = utc.getTime() - now.getTime();
  return {
    valid: true,
    local: String(deadline),
    timeZone,
    utc: utc.toISOString(),
    msRemaining,
    hoursRemaining: Math.round((msRemaining / 3600000) * 10) / 10,
    expired: msRemaining <= 0,
    critical: msRemaining > 0 && msRemaining < 48 * 3600000,
    display: `${String(deadline).replace("T", " ")} ${timeZone} (${utc.toISOString()})`,
  };
}

function getZoneOffsetMinutes(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  const asUtc = Date.UTC(parts.year, Number(parts.month) - 1, parts.day, Number(parts.hour === "24" ? "00" : parts.hour), parts.minute, parts.second);
  return (asUtc - date.getTime()) / 60000;
}

/** Duplicate notice detection across sources (page 38). */
export function detectDuplicateNotice(a, b) {
  const sameRef = a.reference && b.reference && normalise(a.reference) === normalise(b.reference);
  const sameBuyer = normalise(a.buyer) === normalise(b.buyer);
  const titleSim = tokenSimilarity(a.title, b.title);
  const sameDeadline = a.deadline === b.deadline;

  const score = (sameRef ? 0.5 : 0) + (sameBuyer ? 0.2 : 0) + titleSim * 0.25 + (sameDeadline ? 0.05 : 0);
  return {
    duplicate: sameRef || score >= 0.75,
    score: Math.round(score * 100) / 100,
    reason: sameRef
      ? "Same buyer reference number: this is the same procurement opportunity."
      : score >= 0.75
        ? "Buyer, title and deadline align strongly - treat as duplicate until proven otherwise."
        : "Distinct opportunity.",
  };
}

/**
 * Diff a tender amendment against the live requirement set (page 39).
 * A submission built on a superseded version is non-compliant.
 */
export function diffAmendment(previous = {}, next = {}) {
  const changes = [];

  if (previous.deadline && next.deadline && previous.deadline !== next.deadline) {
    changes.push({ type: "deadline", from: previous.deadline, to: next.deadline, severity: "critical", material: true });
  }
  if (previous.submissionMethod && next.submissionMethod && previous.submissionMethod !== next.submissionMethod) {
    changes.push({ type: "submission_method", from: previous.submissionMethod, to: next.submissionMethod, severity: "critical", material: true });
  }

  const prevReqs = new Map((previous.requirements ?? []).map((r) => [r.code, r]));
  const nextReqs = new Map((next.requirements ?? []).map((r) => [r.code, r]));

  for (const [code, req] of nextReqs) {
    const before = prevReqs.get(code);
    if (!before) changes.push({ type: "requirement_added", code, to: req.text, severity: req.mandatory ? "critical" : "medium", material: Boolean(req.mandatory) });
    else if (before.text !== req.text) changes.push({ type: "requirement_changed", code, from: before.text, to: req.text, severity: req.mandatory ? "critical" : "medium", material: Boolean(req.mandatory) });
  }
  for (const [code, req] of prevReqs) {
    if (!nextReqs.has(code)) changes.push({ type: "requirement_removed", code, from: req.text, severity: "medium", material: false });
  }

  const prevLines = new Map((previous.boq ?? []).map((l) => [l.code, l]));
  for (const line of next.boq ?? []) {
    const before = prevLines.get(line.code);
    if (before && Number(before.quantity) !== Number(line.quantity)) {
      changes.push({ type: "quantity_changed", code: line.code, from: before.quantity, to: line.quantity, severity: "critical", material: true });
    }
  }

  return {
    changes,
    materialChanges: changes.filter((c) => c.material),
    requiresRepricing: changes.some((c) => c.type === "quantity_changed" || (c.type === "requirement_changed" && c.material)),
    requiresResubmissionReview: changes.some((c) => c.severity === "critical"),
    verdict: changes.length === 0 ? "no_change" : changes.some((c) => c.severity === "critical") ? "material_amendment" : "minor_amendment",
  };
}

/**
 * Dual-extraction control for OCR of quantities, prices and dates (page 63).
 */
export function reconcileExtraction(primary, secondary, { field = "value", tolerance = 0 } = {}) {
  const a = normaliseNumber(primary?.[field] ?? primary);
  const b = normaliseNumber(secondary?.[field] ?? secondary);
  if (a === null || b === null) {
    return { agreed: false, confidence: "low", action: "human_review", reason: "One extraction pass failed to produce a number." };
  }
  const delta = Math.abs(a - b);
  const agreed = delta <= tolerance;
  return {
    agreed,
    primary: a,
    secondary: b,
    delta,
    confidence: agreed ? "high" : delta / Math.max(a, 1) < 0.01 ? "medium" : "low",
    action: agreed ? "accept" : "human_review",
    reason: agreed ? "Both extraction passes agree." : `Extraction passes disagree by ${delta}; page-level evidence review required.`,
  };
}

/** Match a buyer BOQ line to supplier catalogue lines (page 40). */
export function matchProduct(requirement, candidates = []) {
  const scored = candidates.map((c) => {
    const exactModel = c.model && requirement.model && normalise(c.model) === normalise(requirement.model);
    const specOverlap = tokenSimilarity(requirement.description ?? "", c.description ?? "");
    const unitMatch = normalise(c.unit) === normalise(requirement.unit);
    const score = (exactModel ? 0.7 : 0) + specOverlap * 0.25 + (unitMatch ? 0.05 : 0);
    // A strong description match with a different model is a PARTIAL match: it
    // needs technical evidence and buyer acceptance, not silent substitution.
    const matchType = exactModel ? "exact" : specOverlap >= 0.4 ? "partial" : score >= 0.5 ? "partial" : "no_match";
    const diffs = [];
    if (!exactModel && c.model) diffs.push(`Model ${c.model} differs from required ${requirement.model ?? "unspecified"}`);
    if (!unitMatch) diffs.push(`Unit ${c.unit} differs from required ${requirement.unit}`);
    return {
      candidate: c,
      score: Math.round(score * 100) / 100,
      matchType,
      differences: diffs,
    };
  });
  scored.sort((x, y) => y.score - x.score);
  const best = scored[0];
  return {
    requirement: requirement.code ?? requirement.description,
    best: best ?? null,
    candidates: scored,
    matchType: best?.matchType ?? "no_match",
    requiresTechnicalEvidence: best?.matchType !== "exact",
    requiresBuyerAcceptance: best?.matchType === "partial",
    substitutionRequiresReapproval: true,
  };
}

/** Extract structured product lines from a BOQ text block (deterministic parse). */
export function parseBoqRows(text) {
  return String(text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d+[.)]?\s/.test(l) || /\|/.test(l))
    .map((line) => {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      return { raw: line, cells };
    });
}

function normalise(v) {
  return String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function normaliseNumber(v) {
  if (v === null || v === undefined) return null;
  const cleaned = String(v).replace(/[,\s]/g, "").replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
function tokenSimilarity(a, b) {
  const ta = new Set(String(a).toLowerCase().split(/\W+/).filter((t) => t.length > 2));
  const tb = new Set(String(b).toLowerCase().split(/\W+/).filter((t) => t.length > 2));
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared += 1;
  return shared / Math.max(ta.size, tb.size);
}
