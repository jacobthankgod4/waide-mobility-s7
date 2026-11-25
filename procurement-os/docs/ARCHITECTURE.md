# WPOS — architecture and decision record

## Shape

```
app/                    Next.js 15 App Router console (server-rendered)
  page.tsx              command dashboard
  opportunities/        pipeline + tender workspace
  pricing/[id]/         contribution model, risk adjustment, cash curve
  suppliers/            register + admission detail
  evidence/             corporate evidence vault
  approvals/            amber/red decision centre (server actions)
  contracts/            award → fulfilment → closeout
  finance/              three-way match, duplicates, payment authority
  communications/       outbound classification, inbound quarantine
  compliance/           screening, conflicts, country matrix
  policies/             WAOC register and capability matrix
  audit/                hash-chained ledger and reconstruction
  spec-audit/           100-page audit register
  roadmap/              50 gated phases
  actions.ts            server actions: actor switch, admission, PO, payment, bid, approvals, reset

lib/engines/            deterministic domain — no I/O, no model calls
  policy.mjs            capability matrix, delegated authority, approval validity
  admission.mjs         S0-S3 requirements and promotion gate
  purchaseOrder.mjs     PO issuance gate and approval satisfaction
  paymentControl.mjs    payment preparation and release gates
  bidSubmission.mjs     bid approval and submission gates
  approvals.mjs         dual-control aggregation over a decision set
  margin.mjs            cost waterfall, sector floors, risk adjustment
  cashflow.mjs          peak funding requirement, scenarios, funding admissibility
  country.mjs           weighted scoring, jurisdiction chain, source hierarchy
  gates.mjs             16-check bid gate, submission proof, closeout
  sanctions.mjs         name matching, match-state discipline, resolution
  comms.mjs             outbound policy engine, inbound injection scanner
  evidence.mjs          freshness, scope, access, identity conflict, attribution
  tender.mjs            deadlines/timezones, amendment diff, OCR reconciliation, BOQ match
  obligations.mjs       coverage matrix, prohibited commitments, JV analysis
  incoterms.mjs         Incoterms 2020 matrix, Nigeria import gate
  match3.mjs            three-way matching, duplicates, beneficiary change
  workflow.mjs          five state machines with entry criteria
  idempotency.mjs       event inbox/DLQ, send ledger, sequence and locks
  ledger.mjs            hash-chained append-only audit

lib/view.mjs            composes engines into screen-ready view models
lib/data/               seed modules, spec audit register, roadmap, store adapter
tests/                  119 release-gate tests across engines, extraction and write path
scripts/verify-writepath.mjs  drives the four flows over HTTP and asserts refusals
docs/                   phased plan, 100-page audit, this record
```

## Control flow for any consequential action

1. **Classify** the action against the capability matrix (`policy.mjs`). Unknown capability → deny.
2. **Verify the facts** the action depends on: evidence validity and scope, screening state, freshness, amendment incorporation.
3. **Compute** whatever is arithmetic (margin, cash, coverage) in ordinary code. No model output is authoritative for a number, a limit or a legal gate.
4. **Gate**: `bid_ready` only when all 16 checks pass; otherwise `hold` (unknown) or `no_bid` (fail).
5. **Route** to a named human authority, binding the approval to a payload hash and a 72-hour clock.
6. **Aggregate** decisions in `approvals.mjs`: only a declared authority may decide, a closed approval accepts nothing, and dual control is satisfied by two distinct roles — never the same role twice.
7. **Record** an append-only, hash-chained event with actor, policy decision, approval and result.
8. **Act once**: every send, PO and payment carries an idempotency key and a workflow lock.

The write path is four server actions — `promoteSupplier`, `issuePurchaseOrder`, `preparePayment`/`releasePayment`, `approveBid`/`submitBid`. Each loads the store, calls its engine, and refuses before mutating when the engine blocks. Approval is not a bypass: the action re-runs the full gate on the retry and only proceeds if the approval's payload hash still matches.

## Decision records

**D1 — Deterministic refusals, not persuasive ones.** The specification's central instruction is that an LLM must not decide its own authority. Every gate therefore lives in `.mjs` modules with unit tests; the console renders their output and cannot override it.

**D2 — Domain layer in JavaScript.** The modules must run identically under `node:test` and under Next.js without a build step. TypeScript is used for the UI and server actions; `noImplicitAny` is off only at the JS import boundary, with all schema and state checks enforced at runtime. A production port would re-implement these modules in typed Python/TypeScript behind the same contracts.

**D3 — Store adapter, not a database.** `lib/data/store.mjs` is the only module that touches persistence. It writes `data/runtime/store.json` plus `ledger.json`. The seed regenerates on first read, so the console works from a clean checkout. Replacing it with PostgreSQL + pgvector touches one file.

**D4 — Fail closed on missing identity.** The legal entity's confirmation status is `pending_confirmation` and is displayed, not silently assumed. Cross-document name mismatch (trading name vs registered name) is a conflict, not a cosmetic difference.

**D5 — Cash over profit.** A contract can be profitable and still unfundable. The cash model separates cleared inflows, committed facilities, expected receipts and uncommitted promises, and blocks a bid recommendation when peak need exceeds approved liquidity.

**D6 — Ambiguity is not resolvable by an agent.** Ambiguous mandatory requirements, disputed threads, OCR disagreements and sanctions near-matches all route to human review with the specific gap named.

**D7 — Prohibited means prohibited.** Personal guarantees, unlimited indemnity and liquidated damages, unfunded minimum purchases, exclusivity targets, uninsured cargo exposure, MFA/CAPTCHA bypass, autonomous fund movement and personal attestation are refused for every actor, including the Managing Director inside the platform.

**D8 — The write path is not a UI shortcut.** Admission, PO issuance, payment preparation/release and bid submission each re-run their engine inside the server action, after any approval. Approval is bound to a payload hash and expires after 72 hours, so changing the amount, quantity or supplier voids it; preparation and release of a payment are separate actions by design. The same refusal the engine produces in a unit test is the one a user sees over HTTP.

## Known gaps (deliberate)

| Area | State | Consequence |
| --- | --- | --- |
| Live sources and connectors | Not built | Opportunities, screenings and channel states are seeded fixtures |
| Model runtime | Not built | No extraction, drafting or summarisation is performed |
| Document processing | Not built | Tender files are recorded data, not parsed PDFs |
| Durable workflow (Temporal) | Not built | No timer engine, signals, versioning or compensation |
| Relational database | Not built | No migrations, row-level security or transactional isolation |
| Identity & secrets | Cookie session only | No MFA/WebAuthn, no vault, no key rotation |
| Portal automation | Not built | Submission requires a human-entered receipt reference or URL; no portal upload, screenshot capture or API |
| Monitoring & CI | Partial | Build and tests only; no OTel, Sentry, backup restore drills |
| Commissioning | Not performed | No shadow-mode operation, no sign-off |

These are recorded against specific pages in [`AUDIT_100_PAGES.md`](AUDIT_100_PAGES.md). Production remains disabled by policy until the release gates on page 89 are evidenced.
