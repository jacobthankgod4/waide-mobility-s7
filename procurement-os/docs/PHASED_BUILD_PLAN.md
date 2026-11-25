# Waide Procurement OS — 50-phase build plan

This plan replaces the specification's eight-stage summary with fifty dependency-ordered phases without changing its sequence. A phase may not receive
additional permission before the phase beneath it passes its gate. Status reflects **this workspace build**, not the production target.

**Totals:** 50 phases · 40 shipped · 1 partial · 9 staged

| Status | Meaning |
| --- | --- |
| `shipped` | Built and exercised by the deterministic test suite in this build. |
| `partial` | The control exists; a component named in the gap column is deferred. |
| `staged` | Specified and sequenced; requires infrastructure, a provider account or a human authority. |

## I. Corporate & compliance foundation

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 1 | Policy register, versioning and review triggers | 2, 4 | `shipped` | Policy version resolvable; every decision stores it |
| 2 | Legal entity, registered-name enforcement and signatory register | 10, 27 | `shipped` | Exact registered name; conflicts block submission |
| 3 | Evidence vault: classes, access levels, permitted use, hashes | 10, 15 | `shipped` | Attach requires entity, validity, scope and purpose |
| 4 | Evidence freshness and cross-document identity checks | 10, 35 | `shipped` | Expired or stale evidence cannot support a bid |
| 5 | Country profiles and weighted intelligence score | 6 | `shipped` | Score shows components, coverage and hard stops |
| 6 | Jurisdictional chain and control-regime detection | 7, 57 | `shipped` | Unidentified jurisdiction blocks clearance |
| 7 | Sector hierarchy and margin threshold table | 8, 9, 19 | `shipped` | No sector inherits another's approvals |
| 8 | Capability matrix and permission broker | 5, 66 | `shipped` | Every tool call routed; prohibited actions refused |
| 9 | Hash-chained append-only audit ledger | 65, 78 | `shipped` | Tamper detection proven; per-subject reconstruction |
| 10 | Deterministic state machines with entry criteria | 79, 96 | `shipped` | Illegal transitions refused in code |

## II. Opportunity intelligence

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 11 | Opportunity and source records with retrieval snapshots | 38 | `shipped` | Official URL, retrieval time and level preserved |
| 12 | Duplicate notice detection | 38, 83 | `shipped` | Same reference or buyer+title+deadline collapses |
| 13 | Deadline timezone resolution and criticality | 46 | `shipped` | Local time converted to UTC and validated |
| 14 | Live source connectors: UNGM, World Bank, AfDB, TED, national portals | 38, 73 | `staged` | Official API/feed terms confirmed per source |
| 15 | Scheduler and refresh intervals per data class | 34, 36 | `staged` | Rate limits and outage behaviour documented |
| 16 | Coverage, connector health and failed-item queue | 34, 80 | `partial` | A connector outage creates a visible exception |

## III. Tender document intelligence

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 17 | Requirement set and compliance matrix with page citations | 39 | `shipped` | Mandatory ambiguity blocks bid-ready |
| 18 | Amendment diff, versioning and incorporation gate | 39, 46, 63 | `shipped` | Unincorporated material change blocks submission |
| 19 | BOQ parsing and product match classification | 40 | `shipped` | Partial match requires evidence and buyer acceptance |
| 20 | Dual-extraction reconciliation for OCR quantities and prices | 63, 72 | `shipped` | Disagreement escalates rather than averaging |
| 21 | PDF/Word/Excel extraction pipeline with page provenance | 72 | `staged` | Every critical fact traceable to source coordinates |
| 22 | Sixteen-check bid eligibility gate | 45, 89 | `shipped` | Fail = no-bid, unknown = hold |

## IV. Supplier discovery & email automation

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 23 | Supplier lifecycle S0-S3 with 16-point admission | 16, 85 | `shipped` | Promotion requires evidence; S3 dual approval |
| 24 | Sanctions screening with match-state discipline | 17 | `shipped` | Potential match freezes; resolution needs evidence |
| 25 | Supplier performance scorecards | 18 | `shipped` | Unverified performance suppresses the score |
| 26 | RFQ drafting and message intent classification | 23, 41 | `shipped` | Unknown intent is blocked |
| 27 | Outbound policy engine with eight checks | 23 | `shipped` | No commitment beyond recorded authority |
| 28 | Inbound prompt-injection and exfiltration screen | 24, 62 | `shipped` | Embedded instructions never actioned |
| 29 | Webhook dedupe, retry, dead-letter and send idempotency | 26 | `shipped` | Zero duplicate critical side effects |
| 30 | AgentMail provider integration and inbox separation | 25 | `staged` | DPA, SOC 2 and subprocessors reviewed before use |

## V. Commercial & bid automation

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 31 | Twelve-line direct cost ledger and waterfall | 19 | `shipped` | Every line sourced, dated and certainty-labelled |
| 32 | Sector floor and target decisioning | 19, 20 | `shipped` | Below floor is not auto-biddable |
| 33 | Risk-adjusted margin over payment terms and FX | 20 | `shipped` | 12% prepaid ≠ 12% at 120 days |
| 34 | Peak cash model and stress scenarios | 22 | `shipped` | Unfunded peak blocks the recommendation |
| 35 | Funding-instrument admissibility for advances | 21, 22 | `shipped` | Unconfirmed instrument cannot back a payment |
| 36 | Approval payload binding, expiry and dual routing | 27, 82 | `shipped` | Changed terms void the approval |
| 37 | Bid package manifest and cross-document consistency | 43 | `staged` | Every required file signed and checksummed |

## VI. Portal execution

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 38 | Portal connector scaffolding and scoped sessions | 44, 73 | `staged` | Official API preferred; terms respected |
| 39 | MFA/CAPTCHA/identity human-handoff workflow | 44 | `staged` | Bypass is a prohibited capability |
| 40 | Submission receipt and confirmation capture | 46 | `shipped` | No 'submitted' state without a receipt |

## VII. Contract fulfilment

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 41 | Purchase order generation, acceptance and holds | 48 | `shipped` | PO blocked without funding, capacity and authority |
| 42 | Clause-by-clause obligation coverage matrix | 28, 29 | `shipped` | Unlimited exposure forces legal review |
| 43 | Shipment record, Incoterms 2020 and responsibility allocation | 50, 51 | `shipped` | Inconsistent rule/place/responsibility blocks |
| 44 | Nigeria Form M, SONCAP and NAFDAC release gate | 32, 59 | `shipped` | No release on an assumed customs treatment |
| 45 | Inspection, lot traceability and nonconformity records | 49 | `staged` | No shipment with an unresolved critical nonconformity |

## VIII. Finance, reconciliation & autonomy

| # | Phase | Spec pages | Status | Gate |
| --- | --- | --- | --- | --- |
| 46 | Three-way match with tolerances | 31, 86 | `shipped` | Only matched invoices enter the payment queue |
| 47 | Duplicate detection and beneficiary change control | 30, 31 | `shipped` | Callback + cooling-off + dual approval |
| 48 | Payment authority, dual approval and execution separation | 30, 33 | `shipped` | AI cannot release funds |
| 49 | Realised margin, variance and bid snapshot preservation | 54 | `shipped` | Snapshots never rewritten |
| 50 | Shadow-mode commissioning with measured autonomy | 99, 90 | `staged` | MD, technical, finance and legal sign-off |

## Sequencing rules

- No live supplier correspondence before screening, admission and the outbound policy engine are in place (phases 23–29).
- No portal automation before bid gating and submission-receipt capture (phases 22, 40).
- No payment preparation before three-way matching and beneficiary control (phases 46–47).
- No advance, guarantee or unconditional commitment at any phase without a recorded human approval.
- Shadow-mode commissioning (phase 50) precedes any expansion of autonomy, and requires MD, technical, finance and legal sign-off.
