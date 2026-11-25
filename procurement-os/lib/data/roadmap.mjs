/**
 * Fifty dependency-ordered build phases.
 *
 * status:
 *   shipped  - built and exercised in this workspace build
 *   partial  - control built, a component deferred
 *   staged   - specified and sequenced, requires infrastructure or a provider account
 */

export const ROADMAP = [
  { stage: "I. Corporate & compliance foundation", phases: [
    { n: 1, name: "Policy register, versioning and review triggers", pages: [2, 4], status: "shipped", gate: "Policy version resolvable; every decision stores it" },
    { n: 2, name: "Legal entity, registered-name enforcement and signatory register", pages: [10, 27], status: "shipped", gate: "Exact registered name; conflicts block submission" },
    { n: 3, name: "Evidence vault: classes, access levels, permitted use, hashes", pages: [10, 15], status: "shipped", gate: "Attach requires entity, validity, scope and purpose" },
    { n: 4, name: "Evidence freshness and cross-document identity checks", pages: [10, 35], status: "shipped", gate: "Expired or stale evidence cannot support a bid" },
    { n: 5, name: "Country profiles and weighted intelligence score", pages: [6], status: "shipped", gate: "Score shows components, coverage and hard stops" },
    { n: 6, name: "Jurisdictional chain and control-regime detection", pages: [7, 57], status: "shipped", gate: "Unidentified jurisdiction blocks clearance" },
    { n: 7, name: "Sector hierarchy and margin threshold table", pages: [8, 9, 19], status: "shipped", gate: "No sector inherits another's approvals" },
    { n: 8, name: "Capability matrix and permission broker", pages: [5, 66], status: "shipped", gate: "Every tool call routed; prohibited actions refused" },
    { n: 9, name: "Hash-chained append-only audit ledger", pages: [65, 78], status: "shipped", gate: "Tamper detection proven; per-subject reconstruction" },
    { n: 10, name: "Deterministic state machines with entry criteria", pages: [79, 96], status: "shipped", gate: "Illegal transitions refused in code" },
  ]},
  { stage: "II. Opportunity intelligence", phases: [
    { n: 11, name: "Opportunity and source records with retrieval snapshots", pages: [38], status: "shipped", gate: "Official URL, retrieval time and level preserved" },
    { n: 12, name: "Duplicate notice detection", pages: [38, 83], status: "shipped", gate: "Same reference or buyer+title+deadline collapses" },
    { n: 13, name: "Deadline timezone resolution and criticality", pages: [46], status: "shipped", gate: "Local time converted to UTC and validated" },
    { n: 14, name: "Live source connectors: UNGM, World Bank, AfDB, TED, national portals", pages: [38, 73], status: "staged", gate: "Official API/feed terms confirmed per source" },
    { n: 15, name: "Scheduler and refresh intervals per data class", pages: [34, 36], status: "staged", gate: "Rate limits and outage behaviour documented" },
    { n: 16, name: "Coverage, connector health and failed-item queue", pages: [34, 80], status: "partial", gate: "A connector outage creates a visible exception" },
  ]},
  { stage: "III. Tender document intelligence", phases: [
    { n: 17, name: "Requirement set and compliance matrix with page citations", pages: [39], status: "shipped", gate: "Mandatory ambiguity blocks bid-ready" },
    { n: 18, name: "Amendment diff, versioning and incorporation gate", pages: [39, 46, 63], status: "shipped", gate: "Unincorporated material change blocks submission" },
    { n: 19, name: "BOQ parsing and product match classification", pages: [40], status: "shipped", gate: "Partial match requires evidence and buyer acceptance" },
    { n: 20, name: "Dual-extraction reconciliation for OCR quantities and prices", pages: [63, 72], status: "shipped", gate: "Disagreement escalates rather than averaging" },
    { n: 21, name: "PDF/Word/Excel extraction pipeline with page provenance", pages: [72], status: "staged", gate: "Every critical fact traceable to source coordinates" },
    { n: 22, name: "Sixteen-check bid eligibility gate", pages: [45, 89], status: "shipped", gate: "Fail = no-bid, unknown = hold" },
  ]},
  { stage: "IV. Supplier discovery & email automation", phases: [
    { n: 23, name: "Supplier lifecycle S0-S3 with 16-point admission", pages: [16, 85], status: "shipped", gate: "Promotion requires evidence; S3 dual approval" },
    { n: 24, name: "Sanctions screening with match-state discipline", pages: [17], status: "shipped", gate: "Potential match freezes; resolution needs evidence" },
    { n: 25, name: "Supplier performance scorecards", pages: [18], status: "shipped", gate: "Unverified performance suppresses the score" },
    { n: 26, name: "RFQ drafting and message intent classification", pages: [23, 41], status: "shipped", gate: "Unknown intent is blocked" },
    { n: 27, name: "Outbound policy engine with eight checks", pages: [23], status: "shipped", gate: "No commitment beyond recorded authority" },
    { n: 28, name: "Inbound prompt-injection and exfiltration screen", pages: [24, 62], status: "shipped", gate: "Embedded instructions never actioned" },
    { n: 29, name: "Webhook dedupe, retry, dead-letter and send idempotency", pages: [26], status: "shipped", gate: "Zero duplicate critical side effects" },
    { n: 30, name: "AgentMail provider integration and inbox separation", pages: [25], status: "staged", gate: "DPA, SOC 2 and subprocessors reviewed before use" },
  ]},
  { stage: "V. Commercial & bid automation", phases: [
    { n: 31, name: "Twelve-line direct cost ledger and waterfall", pages: [19], status: "shipped", gate: "Every line sourced, dated and certainty-labelled" },
    { n: 32, name: "Sector floor and target decisioning", pages: [19, 20], status: "shipped", gate: "Below floor is not auto-biddable" },
    { n: 33, name: "Risk-adjusted margin over payment terms and FX", pages: [20], status: "shipped", gate: "12% prepaid ≠ 12% at 120 days" },
    { n: 34, name: "Peak cash model and stress scenarios", pages: [22], status: "shipped", gate: "Unfunded peak blocks the recommendation" },
    { n: 35, name: "Funding-instrument admissibility for advances", pages: [21, 22], status: "shipped", gate: "Unconfirmed instrument cannot back a payment" },
    { n: 36, name: "Approval payload binding, expiry and dual routing", pages: [27, 82], status: "shipped", gate: "Changed terms void the approval" },
    { n: 37, name: "Bid package manifest and cross-document consistency", pages: [43], status: "staged", gate: "Every required file signed and checksummed" },
  ]},
  { stage: "VI. Portal execution", phases: [
    { n: 38, name: "Portal connector scaffolding and scoped sessions", pages: [44, 73], status: "staged", gate: "Official API preferred; terms respected" },
    { n: 39, name: "MFA/CAPTCHA/identity human-handoff workflow", pages: [44], status: "staged", gate: "Bypass is a prohibited capability" },
    { n: 40, name: "Submission receipt and confirmation capture", pages: [46], status: "shipped", gate: "No 'submitted' state without a receipt" },
  ]},
  { stage: "VII. Contract fulfilment", phases: [
    { n: 41, name: "Purchase order generation, acceptance and holds", pages: [48], status: "shipped", gate: "PO blocked without funding, capacity and authority" },
    { n: 42, name: "Clause-by-clause obligation coverage matrix", pages: [28, 29], status: "shipped", gate: "Unlimited exposure forces legal review" },
    { n: 43, name: "Shipment record, Incoterms 2020 and responsibility allocation", pages: [50, 51], status: "shipped", gate: "Inconsistent rule/place/responsibility blocks" },
    { n: 44, name: "Nigeria Form M, SONCAP and NAFDAC release gate", pages: [32, 59], status: "shipped", gate: "No release on an assumed customs treatment" },
    { n: 45, name: "Inspection, lot traceability and nonconformity records", pages: [49], status: "staged", gate: "No shipment with an unresolved critical nonconformity" },
  ]},
  { stage: "VIII. Finance, reconciliation & autonomy", phases: [
    { n: 46, name: "Three-way match with tolerances", pages: [31, 86], status: "shipped", gate: "Only matched invoices enter the payment queue" },
    { n: 47, name: "Duplicate detection and beneficiary change control", pages: [30, 31], status: "shipped", gate: "Callback + cooling-off + dual approval" },
    { n: 48, name: "Payment authority, dual approval and execution separation", pages: [30, 33], status: "shipped", gate: "AI cannot release funds" },
    { n: 49, name: "Realised margin, variance and bid snapshot preservation", pages: [54], status: "shipped", gate: "Snapshots never rewritten" },
    { n: 50, name: "Shadow-mode commissioning with measured autonomy", pages: [99, 90], status: "staged", gate: "MD, technical, finance and legal sign-off" },
  ]},
];

export const ROADMAP_FLAT = ROADMAP.flatMap((s) => s.phases.map((p) => ({ ...p, stage: s.stage })));

export const ROADMAP_STATS = {
  total: ROADMAP_FLAT.length,
  shipped: ROADMAP_FLAT.filter((p) => p.status === "shipped").length,
  partial: ROADMAP_FLAT.filter((p) => p.status === "partial").length,
  staged: ROADMAP_FLAT.filter((p) => p.status === "staged").length,
};
