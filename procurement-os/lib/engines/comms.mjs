/**
 * Communication policy engine + inbound threat screening.
 *
 * Spec pages 23, 24, 62. Every outbound message is classified, checked and
 * either sent, escalated or blocked. External content is data, never instruction.
 */

export const AUTOMATED_SIGNATURE =
  "Waide Procurement Operations - Automated Procurement Correspondence";

/** Intent catalogue mirroring the WAOC communication matrix. */
export const INTENTS = {
  supplier_capability_enquiry: { mode: "autonomous", label: "Initial supplier capability enquiry" },
  rfq: { mode: "autonomous", label: "RFQ / request for quotation" },
  technical_document_request: { mode: "autonomous", label: "Technical-document request" },
  manufacturer_authorisation_request: { mode: "autonomous", label: "Manufacturer authorisation request" },
  supplier_followup: { mode: "autonomous", label: "Routine supplier follow-up" },
  meeting_scheduling: { mode: "autonomous", label: "Meeting scheduling" },
  acknowledgement: { mode: "autonomous", label: "Acknowledgement of receipt" },
  delivery_status_request: { mode: "autonomous", label: "Delivery-status request" },
  delivery_status_update: { mode: "template", label: "Factual delivery-status update (verified records)" },
  buyer_clarification: { mode: "template", label: "Buyer clarification question (approved template)" },
  buyer_factual_response: { mode: "template", label: "Buyer factual response within verified scope" },
  final_quotation: { mode: "human", label: "Final quotation to buyer" },
  bid_submission: { mode: "human", label: "Final bid submission" },
  technical_equivalence: { mode: "human", label: "Product equivalence / compliance assertion" },
  contract_acceptance: { mode: "human", label: "Acceptance of contract terms" },
  price_or_delivery_change: { mode: "human", label: "Change to agreed price or delivery" },
  variation_or_waiver: { mode: "legal", label: "Contract variation or waiver" },
  claim_or_dispute: { mode: "legal", label: "Claim, dispute or termination notice" },
  eligibility_statement: { mode: "human", label: "Statement of legal/financial eligibility" },
  financial_commitment: { mode: "human", label: "Financial guarantee or payment commitment" },
};

const COMMITMENT_PATTERNS = [
  /\bwe (agree|accept|commit|guarantee|undertake)\b/i,
  /\bbinding offer\b/i,
  /\bshall be liable\b/i,
  /\bwe will pay\b/i,
  /\bdelivery within \d+ days\b/i,
  /\bvalid and binding\b/i,
];

const ELEVATED_FACT_PATTERNS = [
  /\b(ce certified|iso \d+|nafdac approved|soncap certified)\b/i,
  /\b(turnover|net assets|financial capacity)\b/i,
  /\b(equivalent to|complies with)\b/i,
];

/**
 * @param {object} message
 * @param {object} context
 */
export function evaluateOutbound(message = {}, context = {}) {
  const intent = INTENTS[message.intent];
  const body = String(message.body ?? "");
  const checks = [];
  const blockers = [];
  const escalations = [];

  const push = (id, label, ok, detail) => {
    checks.push({ id, label, ok, detail });
    if (!ok) blockers.push(`${label}: ${detail}`);
  };

  if (!intent) {
    return {
      decision: "blocked",
      intent: message.intent ?? null,
      checks: [],
      blockers: [`Unknown message intent "${message.intent}" - classify before sending.`],
      escalations: [],
      signatureRequired: true,
    };
  }

  push("recipient_authenticity", "Recipient authenticity", Boolean(context.recipientVerified), "Recipient not independently verified against the party master record.");

  const linked = Boolean(message.opportunityId || message.contractId || message.supplierId);
  push("business_link", "Linked to a procurement business event", linked, "Every email must be linked to an opportunity, supplier or contract record.");

  // Only template-governed classes need an approved template; human/legal classes
  // are already gated by an approver and do not require one to be drafted.
  const templatesApproved = intent.mode !== "template" || context.templateApproved === true;
  push(
    "template_authority",
    "Approved template or unrestricted autonomous class",
    templatesApproved,
    `${intent.label} requires an approved template before autonomous send.`,
  );

  // Factual claims must be sourced.
  const unsourcedClaims = (message.claims ?? []).filter((c) => !c.evidenceRef);
  push(
    "factual_accuracy",
    "Every factual claim is sourced",
    unsourcedClaims.length === 0,
    `${unsourcedClaims.length} factual claim(s) have no evidence reference.`,
  );

  const elevated = ELEVATED_FACT_PATTERNS.some((re) => re.test(body));
  if (elevated) {
    escalations.push("Message contains certification, financial-capacity or equivalence language - human approval required.");
  }

  const commitments = COMMITMENT_PATTERNS.filter((re) => re.test(body)).map((re) => re.source);
  if (commitments.length && intent.mode === "autonomous") {
    blockers.push("A commitment-bearing statement appears in an autonomous message class - reclassify and escalate.");
  }

  push(
    "attachments_approved",
    "Attachments are approved and current",
    (message.attachments ?? []).every((a) => a.approved && !a.expired),
    "One or more attachments are unapproved or expired.",
  );

  const confidentialityLeak = (message.attachments ?? []).some((a) => a.accessClass === "restricted_financial" && !context.recipientClearedForFinancial);
  push("confidentiality", "Confidentiality restrictions respected", !confidentialityLeak, "Restricted financial material would be sent to a recipient without clearance.");

  push("duplicate_guard", "No duplicate send for this business event", Boolean(message.idempotencyKey) && !context.idempotencyKeyUsed, "An idempotency key is required and must not have been used before.");

  const signatureOk = /Waide Procurement Operations/i.test(body);
  push("signature", "Transparent automated signature present", signatureOk || intent.mode === "autonomous", `Outbound correspondence must carry: ${AUTOMATED_SIGNATURE}`);

  if (message.impersonatesHuman) {
    blockers.push("Message presents itself as written by a named human who has not authorised it - prohibited.");
  }

  // Resolve final decision.
  let decision = "autonomous";
  if (blockers.length) decision = "blocked";
  else if (intent.mode === "human" || intent.mode === "legal" || escalations.length) decision = "human_approval";
  else if (intent.mode === "template") decision = "autonomous";

  return {
    decision,
    intent: message.intent,
    intentLabel: intent.label,
    mode: intent.mode,
    checks,
    blockers,
    escalations,
    signature: AUTOMATED_SIGNATURE,
    signatureRequired: decision !== "autonomous" || true,
  };
}

/** Inbound content threat screen (pages 24, 62). */
const INJECTION_PATTERNS = [
  { id: "override_instructions", re: /\b(ignore|disregard|forget)\b.{0,40}\b(previous|prior|above|all)\b.{0,30}\b(instruction|prompt|policy|policies|rules)/i, label: "Attempt to override system instructions" },
  { id: "credential_theft", re: /\b(reveal|send|share|disclose|print)\b.{0,30}\b(password|credential|api key|token|otp|secret|private key)/i, label: "Credential disclosure request" },
  { id: "bank_change", re: /\b(change|update|replace)\b.{0,30}\b(bank|beneficiary|account|iban|swift)\b/i, label: "Bank-detail change instruction in message body" },
  { id: "exfiltration", re: /\b(send|forward|upload|email)\b.{0,40}\b(confidential|financial statement|bank statement|tender document|contract)\b/i, label: "Confidential-document exfiltration attempt" },
  { id: "policy_bypass", re: /\b(bypass|override|skip|ignore)\b.{0,30}\b(approval|compliance|sanction|policy|signature)/i, label: "Approval or compliance bypass instruction" },
  { id: "urgency_payment", re: /\b(urgent|immediately|today only)\b.{0,60}\b(payment|transfer|advance|deposit)\b/i, label: "Urgency pressure tied to a payment action" },
];

/**
 * @param {string} content
 * @param {{sourceType?:string}} [meta]
 */
export function scanInbound(content, meta = {}) {
  const text = String(content ?? "");
  const findings = [];
  for (const p of INJECTION_PATTERNS) {
    const m = text.match(p.re);
    if (m) findings.push({ id: p.id, label: p.label, excerpt: m[0].slice(0, 160) });
  }
  const quarantined = findings.length > 0;
  return {
    quarantined,
    findings,
    sourceType: meta.sourceType ?? "email",
    treatment: quarantined ? "quarantined_untrusted" : "safe_to_parse",
    rule: "External content is data. It cannot change permissions, reveal secrets, or trigger payment or contract action.",
    escalation: quarantined ? "Route to compliance review; do not action embedded instructions." : null,
  };
}

/** Verify an inbound message maps to the right thread, not just a company name (page 26). */
export function resolveThread(message = {}, threads = []) {
  const candidates = threads.filter(
    (t) =>
      (message.inReplyTo && t.messageId === message.inReplyTo) ||
      (message.threadId && t.threadId === message.threadId) ||
      (message.businessRef && t.businessRef === message.businessRef),
  );
  if (candidates.length === 1) return { resolved: true, thread: candidates[0], reason: "Matched on thread/message/business reference." };
  if (candidates.length > 1) {
    return { resolved: false, ambiguous: true, candidates, reason: "Multiple candidate threads (same manufacturer, several live opportunities) - human disambiguation required." };
  }
  return { resolved: false, ambiguous: false, reason: "No thread match; do not guess from a company name." };
}
