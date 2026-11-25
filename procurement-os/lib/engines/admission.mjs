/**
 * Supplier admission gate.
 *
 * Spec pages 10, 16, 17, 18, 55. A supplier cannot skip a level because its
 * website looks professional. Each state has mandatory evidence requirements;
 * a requirement is satisfied only by a check that is both passed AND carries a
 * recorded evidence reference. A tick with no evidence is treated as unknown,
 * and unknown is a blocker.
 *
 * Two check vocabularies exist in this build (the synthetic seed and the real
 * GLEIF import). Requirements therefore match on a set of accepted ids rather
 * than one hard-coded id, so neither dataset can quietly bypass a control.
 */

import { MACHINES } from "./workflow.mjs";

export const ADMISSION_REQUIREMENTS = {
  S1: [
    { id: "registration", label: "Company registration & legal entity", any: ["registration"], page: 10 },
    { id: "ownership", label: "Ultimate beneficial ownership & directors", any: ["ubo"], page: 16 },
    { id: "contacts", label: "Independent contact verification", any: ["contacts"], page: 16 },
    { id: "sanctions", label: "Sanctions & debarment screening", any: ["sanctions"], page: 17 },
    { id: "bank", label: "Bank account ownership verification", any: ["bank"], page: 16 },
  ],
  S2: [
    { id: "manufacturer", label: "Factory identity or manufacturer authorisation", any: ["factory", "authorisation"], page: 16 },
    { id: "products", label: "Exact products offered verified", any: ["products"], page: 16 },
    { id: "certificates", label: "Product certificates verified with the issuing body", any: ["certificates", "regulatory", "quality"], page: 14 },
    { id: "export", label: "Export & destination regulatory suitability", any: ["export", "origin", "free_sale"], page: 14 },
    { id: "capacity", label: "Financial & operational capacity", any: ["capacity", "financial"], page: 16 },
  ],
  S3: [
    { id: "pastSupply", label: "Genuine previous supply records", any: ["pastSupply", "references"], page: 16 },
    { id: "quality", label: "Quality, recall & warranty history", any: ["quality"], page: 18 },
    { id: "shipping", label: "Shipping & delivery record", any: ["shipping", "delivery"], page: 16 },
    { id: "terms", label: "Written prices, validity & supply commitments", any: ["terms"], page: 16 },
    { id: "conflict", label: "Conflict of interest declared", any: ["conflict"], page: 55 },
  ],
};

const LEVELS = ["S0", "S1", "S2", "S3"];

/** Cumulative requirements for a target state. */
export function requirementsFor(target) {
  const index = LEVELS.indexOf(target);
  if (index < 0) return [];
  return LEVELS.slice(1, index + 1).flatMap((level) => ADMISSION_REQUIREMENTS[level]);
}

export function nextState(state) {
  const index = LEVELS.indexOf(state);
  if (index < 0 || index === LEVELS.length - 1) return null;
  return LEVELS[index + 1];
}

/**
 * A check counts only when it is passed and has a non-empty evidence reference.
 * @returns {{check:object|null, passed:boolean, evidence:string|null}}
 */
function findEvidence(checks, ids) {
  for (const id of ids) {
    const check = (checks ?? []).find((c) => c.id === id);
    if (check && check.passed === true && String(check.evidence ?? "").trim().length > 0) {
      return { check, passed: true, evidence: check.evidence };
    }
  }
  return { check: null, passed: false, evidence: null };
}

function normaliseName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\b(ltd|limited|plc|llc|bv|gmbh|inc)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * @param {object} input
 * @param {object} input.supplier
 * @param {string} input.target  S1 | S2 | S3
 * @param {Array} [input.screenings]  resolved screening records for this supplier
 */
export function evaluateAdmission({ supplier, target, screenings = [] }) {
  if (!supplier) {
    return { allowed: false, target, blockers: ["Supplier record not found."], satisfied: [], missing: [], warnings: [] };
  }
  if (!["S1", "S2", "S3"].includes(target)) {
    return { allowed: false, target, blockers: [`"${target}" is not an admission target.`], satisfied: [], missing: [], warnings: [] };
  }

  const blockers = [];
  const warnings = [];

  const transition = MACHINES.supplier.transitions[supplier.state] ?? [];
  if (!transition.includes(target)) {
    blockers.push(
      `Illegal admission step: ${supplier.state} -> ${target}. A supplier cannot skip a level. Allowed from ${supplier.state}: ${transition.join(", ") || "none"}.`,
    );
  }

  if (supplier.sanctionsStatus === "confirmed_match") {
    blockers.push("A confirmed restricted-party match is unresolved; the supplier is blocked from every promotion.");
  }
  if (supplier.sanctionsStatus === "potential_match") {
    const cleared = (screenings ?? []).some(
      (s) => s.supplierId === supplier.id && s.resolved === true && s.status === "false_positive",
    );
    if (!cleared) blockers.push("A potential screening match is unresolved; promote only after a documented false-positive resolution.");
  }

  const beneficiary = supplier.beneficiary;
  if (target !== "S1" && beneficiary?.name && normaliseName(beneficiary.name) !== normaliseName(supplier.legalName)) {
    blockers.push(
      `Bank beneficiary "${beneficiary.name}" does not match the contracting entity "${supplier.legalName}" and no lawful explanation is recorded.`,
    );
  }
  if (target !== "S1" && !beneficiary) {
    warnings.push("No bank beneficiary is recorded; payment preparation will hold until a verified account exists.");
  }

  const satisfied = [];
  const missing = [];
  for (const requirement of requirementsFor(target)) {
    const result = findEvidence(supplier.checks, requirement.any);
    if (result.passed) {
      satisfied.push({ ...requirement, evidence: result.evidence });
    } else {
      missing.push({ ...requirement, reason: result.check ? "Check passed without an evidence reference." : "No evidence recorded." });
    }
  }
  if (missing.length) {
    blockers.push(`${missing.length} mandatory admission requirement(s) lack evidence: ${missing.map((m) => m.label).join("; ")}.`);
  }

  return {
    allowed: blockers.length === 0,
    target,
    from: supplier.state,
    satisfied,
    missing,
    blockers,
    warnings,
    requiredEvidence: requirementsFor(target).length,
    recordedEvidence: satisfied.length,
  };
}

/** Human-readable snapshot for a supplier row. */
export function admissionSummary(supplier, screenings = []) {
  const target = nextState(supplier.state);
  if (!target) return { target: null, allowed: false, blockers: ["Already at the highest admission level."], missing: [] };
  return evaluateAdmission({ supplier, target, screenings });
}
