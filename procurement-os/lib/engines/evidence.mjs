/**
 * Corporate evidence vault rules.
 *
 * Spec pages 10-15, 35, 78. Validity, entity scope, permitted use, freshness and
 * access class determine whether a document may support a bid.
 */

export const ACCESS_CLASSES = {
  public: { rank: 0, label: "Public" },
  internal: { rank: 1, label: "Internal" },
  confidential: { rank: 2, label: "Confidential" },
  restricted_financial: { rank: 3, label: "Restricted financial" },
  secret: { rank: 4, label: "Secret (never in vault)" },
};

export const DOC_CLASSES = {
  corporate_identity: "Corporate identity",
  tax_statutory: "Tax & statutory compliance",
  financial: "Financial evidence",
  past_performance: "Past performance",
  sector_credential: "Sector credential",
  personnel: "Personnel",
  insurance: "Insurance",
  signatory: "Signatory authority",
  registration: "Registration / portal",
};

/** Freshness policy per data class (page 36). */
export const FRESHNESS_POLICY = {
  corporate_identity: { warnDays: 365, maxDays: 1825 },
  tax_statutory: { warnDays: 30, maxDays: 365 },
  financial: { warnDays: 90, maxDays: 365 },
  past_performance: { warnDays: 180, maxDays: 3650 },
  sector_credential: { warnDays: 45, maxDays: 365 },
  personnel: { warnDays: 60, maxDays: 730 },
  insurance: { warnDays: 30, maxDays: 365 },
  signatory: { warnDays: 30, maxDays: 365 },
  registration: { warnDays: 30, maxDays: 365 },
  supplier_quote: { warnDays: 0, maxDays: 30 },
  fx_rate: { warnDays: 0, maxDays: 3 },
  freight_quote: { warnDays: 0, maxDays: 14 },
  sanctions_screening: { warnDays: 0, maxDays: 7 },
  tender_document: { warnDays: 0, maxDays: 30 },
};
export const DEFAULT_FRESHNESS = { warnDays: 14, maxDays: 60 };

export function daysUntil(date, now = new Date()) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

/** Freshness verdict for any operational fact (page 35). */
export function freshness(record, kind = "corporate_identity", now = new Date()) {
  const policy = FRESHNESS_POLICY[kind] ?? DEFAULT_FRESHNESS;

  const verifiedAge = record.lastVerifiedAt
    ? Math.floor((now.getTime() - new Date(record.lastVerifiedAt).getTime()) / 86400000)
    : null;

  const daysLeft = daysUntil(record.expires ?? record.effectiveUntil, now);
  let status = "current";
  const reasons = [];

  if (verifiedAge === null) {
    status = "unverified";
    reasons.push("Never verified: cannot support a binding decision.");
  } else if (verifiedAge > policy.maxDays) {
    status = "stale";
    reasons.push(`Last verified ${verifiedAge} days ago (max ${policy.maxDays}).`);
  } else if (verifiedAge > policy.warnDays) {
    status = "expiring";
    reasons.push(`Verification ageing: ${verifiedAge} days since last check.`);
  }

  if (daysLeft !== null && daysLeft < 0) {
    status = "expired";
    reasons.push(`Document expired ${Math.abs(daysLeft)} day(s) ago.`);
  } else if (daysLeft !== null && daysLeft <= 30 && status === "current") {
    status = "expiring";
    reasons.push(`Expires in ${daysLeft} day(s).`);
  }

  return {
    status,
    // Expired, stale or never-verified facts may not support a binding decision;
    // an ageing-but-valid fact may (it is flagged for refresh).
    usableForBindingDecision: !["expired", "stale", "unverified"].includes(status),
    verifiedAgeDays: verifiedAge,
    daysLeft,
    reasons,
    policy,
  };
}

/**
 * Can this document be attached to a bid? (page 10 acceptance gate)
 */
export function evaluateEvidence(doc, context = {}, now = new Date()) {
  const issues = [];
  const f = freshness(doc, doc.class, now);

  if (!doc.verifiedSource) issues.push({ code: "no_source", message: "Verified source is not recorded." });
  if (!doc.legalEntity) issues.push({ code: "no_entity", message: "Legal entity is not recorded." });
  if (doc.verificationStatus !== "verified") issues.push({ code: "unverified", message: `Verification status is "${doc.verificationStatus}".` });
  if (f.status === "expired") issues.push({ code: "expired", message: `Expired ${Math.abs(f.daysLeft ?? 0)} day(s) ago.`, blocking: true });
  if (f.status === "stale") issues.push({ code: "stale", message: "Document is stale and must be re-verified.", blocking: true });

  if (context.legalEntity && doc.legalEntity && context.legalEntity !== doc.legalEntity) {
    issues.push({ code: "wrong_entity", message: `Document belongs to "${doc.legalEntity}", not "${context.legalEntity}".`, blocking: true });
  }
  if (context.purpose && !(doc.permittedUses ?? []).includes(context.purpose)) {
    issues.push({ code: "not_permitted", message: `Permitted uses (${(doc.permittedUses ?? []).join(", ") || "none"}) exclude "${context.purpose}".`, blocking: true });
  }
  if (context.productModel && doc.productModel && doc.productModel !== context.productModel) {
    issues.push({ code: "scope_mismatch", message: `Certificate scope covers model ${doc.productModel}, not ${context.productModel}.`, blocking: true });
  }
  if (context.requiredAccessRank !== undefined) {
    const rank = ACCESS_CLASSES[doc.accessClass]?.rank ?? 0;
    if (rank > context.requiredAccessRank) {
      issues.push({ code: "access", message: `Access class ${doc.accessClass} exceeds the recipient's clearance.`, blocking: true });
    }
  }

  const blocking = issues.filter((i) => i.blocking);

  return {
    docId: doc.id,
    title: doc.title,
    attachable: blocking.length === 0,
    issues,
    freshness: f,
    verdict:
      blocking.length === 0
        ? "attach_ok"
        : issues.some((i) => i.code === "expired")
          ? "expired"
          : issues.some((i) => i.code === "scope_mismatch")
            ? "scope_mismatch"
            : issues.some((i) => i.code === "wrong_entity")
              ? "wrong_entity"
              : "invalid",
  };
}

/**
 * Cross-document identity conflict detection (page 10).
 */
export function detectIdentityConflicts(entity, docs = []) {
  const conflicts = [];
  const registered = entity.registeredName;
  for (const d of docs) {
    if (d.holderName && normalise(d.holderName) !== normalise(registered)) {
      conflicts.push({
        docId: d.id,
        title: d.title,
        field: "legal_name",
        expected: registered,
        found: d.holderName,
        message: `Document holder "${d.holderName}" does not match CAC-registered name "${registered}". Company identity conflicts block submission.`,
      });
    }
    if (d.rcNumber && entity.rcNumber && d.rcNumber !== entity.rcNumber) {
      conflicts.push({ docId: d.id, title: d.title, field: "rc_number", expected: entity.rcNumber, found: d.rcNumber, message: "Registration number mismatch." });
    }
  }
  return { conflicts, clean: conflicts.length === 0 };
}

/** Credential reuse guard: a partner's experience is never Waide's (page 13). */
export function attributionCheck(record, waideEntityId) {
  const own = record.performingEntityId === waideEntityId;
  return {
    attributableToWaide: own,
    label: own ? "Waide's own performance" : `Partner performance (${record.performingEntityName ?? "third party"}) - must be labelled as partner experience`,
    allowedInBidAs: own ? "own_experience" : "partner_experience_with_consent",
    warning: own ? null : "A manufacturer's or partner's contract cannot be presented as Waide's own past performance.",
  };
}

/**
 * Legal-name comparison. Deliberately does NOT strip Ltd/Limited/PLC: the exact
 * registered name is what submissions must carry, so "Waide Mobility Ltd" and
 * "Waide Mobility Limited" are a reportable inconsistency (page 10).
 */
function normalise(v) {
  return String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
