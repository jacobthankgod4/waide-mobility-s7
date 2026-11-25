# Infrastructure status

What is actually running on this machine, what is not, and the evidence for
each. Nothing in this file is aspirational: a component listed as running was
started and queried; a component listed as blocked names the exact error.

Audited: 25 November 2026, Windows, no administrator rights, no Docker, no
Python, no Java.

## Summary

| Component | Spec target | Status here | Evidence |
| --- | --- | --- | --- |
| Console | Next.js | **Running** | 13 routes return 200 on `127.0.0.1:4780` |
| Database | PostgreSQL | **Running (embedded)** | `SELECT version()` → `PostgreSQL 19.0 (PGlite 0.6.0) on wasm32` |
| Database server | PostgreSQL TCP | **Blocked** | native binaries exit `0xC0000135` (MSVC runtime missing); needs admin |
| Workflow engine | Temporal | **Server running, worker blocked** | server 1.32.2 serving; workflows and activities written; the Node SDK's Rust bridge cannot load (missing MSVC runtime) |
| Browser automation | Playwright | **Running** | Chromium 1255 launched against the live console; title read back |
| Document extraction | Docling | **Replaced** | custom pipeline; two real ITBs parsed, OCR verified |
| Object storage | S3 | **Not running** | MinIO binary returns 410; no S3-compatible server installed |
| Web API | FastAPI | **Not present** | no Python on the machine |
| Identity | Keycloak | **Not present** | no Java runtime on the machine |
| Model runtime | OpenAI Agents SDK | **Not called** | no model credentials; the system is deterministic by design |
| Mail | AgentMail | **Connected, live** | 190 SDK methods wired and resolved; key from the waide-mobility account authenticates, inbox `jacob-agent@agentmail.to` answers, a gated RFQ was sent |

---

## 1. PostgreSQL 19 (embedded, real engine)

`lib/data/postgres.mjs` runs PGlite — the PostgreSQL engine compiled to
WebAssembly — inside the Node process. This is the real engine: real SQL, real
types, real constraints, real transactions.

```
engine: PostgreSQL 19.0 (PGlite 0.6.0) on wasm32-unknown-emscripten
mirrored: {"suppliers":6,"documents":0,"ledger":11}
stats: suppliers 41 · documents 0 · ledger 11
```

Schema: `suppliers`, `screening_matches`, `documents`, `ledger`, with foreign
keys and indexes. Data directory: `.tools/pgdata-sql` (git-ignored).

Why not a server: `embedded-postgres` downloads the official Windows binaries,
which fail at init with `0xC0000135` = `STATUS_DLL_NOT_FOUND` — the MSVC
redistributable is absent and installing it requires an administrator. To use a
shared server instead, replace `connect()` with a `pg` client; the schema and
every query are plain PostgreSQL and unchanged.

To run:

```
node -e "import('./lib/data/postgres.mjs').then(async m => { const s = await import('./lib/data/store.mjs'); await m.mirrorStore(s.loadStore()); console.log(await m.stats()); await m.close() })"
```

## 2. Temporal 1.32.2

Real Temporal server, local persistence, started from the official CLI:

```
Temporal Server:      localhost:7233
Temporal Persistence: .tools/temporal.db
Temporal UI:          http://localhost:8233
SERVING
```

Start:

```
.tools/bin/temporal.exe server start-dev --headless --ip 127.0.0.1 --port 7233 --ui-port 8233 --db-filename .tools/temporal.db
```

State: the server is up and healthy and the workflow code now exists, but the
**worker cannot start on this machine**: `@temporalio/core-bridge` fails to load
its `index.node` with `ERR_DLOPEN_FAILED` / "The specified module could not be
found". The cause is the same one that stops native PostgreSQL
(`0xC0000135`): `vcruntime140.dll` and `vcruntime140_1.dll` are absent. Only the
CLR-flavoured `vcruntime140_clr0400.dll` is installed, and neither `System32` nor
`WinSxS` holds the plain runtime. The redistributable's `/layout` extraction
requires a UI/elevation and did not complete, so the fix is installing
**Microsoft Visual C++ 2015-2022 Redistributable (x64)** once, with admin, then
`npm run worker`.

### What is written and verified

| File | Purpose |
| --- | --- |
| `lib/temporal/workflows.cjs` | `approvalWorkflow` (signal-driven dual control, timeout is not approval) and `bidWorkflow` (gate → signatory → portal receipt) |
| `lib/temporal/activities.mjs` | Five activities, each re-running the same deterministic engine the console uses |
| `scripts/temporal-worker.mjs` | Worker on task queue `waide-procurement`, `SIGINT`/`SIGTERM` shutdown |
| `scripts/temporal-run.mjs` | Driver: starts a workflow, sends decisions/receipts, prints the outcome |

The workflows hold **no decision logic**. `recordBidApproval` re-runs
`evaluateBidApproval` with the approver's own role, so a signal that claims
`managing_director` from an AI actor is refused inside the activity, exactly as
the console refuses it.

Verified by calling the activities directly against the live store (state
restored afterwards):

| Probe | Result |
| --- | --- |
| `managing_director` signs first | `awaiting_second`, `secondApproverRole: finance_approver` |
| Same `managing_director` signs again | refused — "A distinct authority is required" |
| `finance_approver` signs | `approved` with two distinct decisions |
| Bid gate for `OPP-2026-018` | blocked — supplier not S2/S3 |
| `recordBidApproval` as `ai_agent` | refused — "AI has no legal signature or approval authority" |
| `recordBidApproval` as `managing_director` | refused — gate still fails |
| `recordBidSubmission` with `{}` receipt | blocked, no proof |

Not verified, because no worker can run: a workflow executing end to end inside
Temporal, signal delivery to a live workflow, and replay determinism.

## 3. Playwright 1.65.1 + Chromium 1255

Installed with the Chromium bundle. Verified by driving the running console:

```
title: Waide Procurement OS
screenshot: data/samples/dashboard.png (188 KB, 1440x1100)
```

That screenshot was then fed through the extraction pipeline as an image, which
exercised OCR (below). Portal capture — the reason Playwright is in the spec —
is not yet automated: the browser opens and can be scripted, but no procurement
portal has a recorded flow.

## 4. Document extraction (replaces Docling)

Docling is a Python package requiring PyTorch; there is no Python on this
machine, and the requirement was to build the pipeline, so it is built in Node
and runs in the same process as the console.

| Stage | Implementation |
| --- | --- |
| Type detection | magic bytes first, extension only as tie-break |
| PDF | `pdfjs-dist` legacy build, per-page lines rebuilt from baseline coordinates |
| DOCX | `mammoth`, tables flattened to one line per row |
| XLSX | `exceljs`, all sheets, merged cells and dates preserved |
| CSV / TXT / HTML / EML | dedicated readers, same page-shaped output |
| Scanned pages | Tesseract (WASM) OCR, no native build |
| Classification | weighted keyword scoring with a confidence margin; low margin → `unknown` |
| Requirements | Incoterms 2020, HS codes, quantities, money, dated terms, payment terms, bid security, eligibility vocabulary — each with page, line and snippet |

Evidence, on two real tender documents downloaded from their official hosts:

```
data/samples/iom-itb-pakistan.pdf  47 pages, 97,120 chars, tender_notice
  incoterm FCA (place rejected: "prices" is not a place)  [p29 l22]
  closing_date missing → critical missing (this ITB defers to a data sheet)
  complete: false

data/samples/unfpa-itb-angola.pdf  65 pages, 106,350 chars, tender_notice
  incoterm DAP  [p39 l10]
  closing_date 2025-08-14  [p25 l18]
  issue_date   2025-07-24  [p1 l7]
```

OCR, on a screenshot of this console:

```
data/samples/dashboard.png  3,221 characters read
document type: bank_guarantee (0.77) — wrong
```

That last line is an honest limitation: the OCR reads the page correctly but the
classifier has no concept of "this is a web page", so it latched on to the phrase
"performance bond is unpriced" in the dashboard copy. A screenshot is not a
procurement document; the pipeline reports its guess with a confidence rather
than pretending certainty.

Use:

```
npm run extract -- <file>          # human-readable summary
npm run extract -- <file> --json   # machine record
npm run extract -- <file> --text   # extracted text only
```

## 5. Not running

**S3 / object storage.** The MinIO Windows binary now returns HTTP 410 at its
documented URL, and no other S3-compatible server is installed. Nothing in the
console currently stores objects; documents live in `data/runtime` and in
PostgreSQL. If object storage becomes necessary, `s3rver` (Node) gives a local
S3 API, but that is a substitution to be stated, not a real S3.

**FastAPI.** There is no Python on this machine. The document pipeline is
therefore Node, in-process, and callable from the console — which is where it
needs to run anyway. Standing up a separate Python service would add a network
hop and a second deployment for no functional gain.

**Keycloak.** Requires a JVM; `java` is not installed. The console's actor model
(`lib/session.mjs`, a cookie selecting one of four roles) is a demonstration
seam, not authentication. Real OIDC is the correct next step and needs a JDK
(portable Temurin) plus a Keycloak distribution — both downloadable without
admin, neither installed.

**OpenAI Agents SDK.** No model is called anywhere. Every decision in this
system — authority, margin, gates, screening, extraction classification — is
deterministic code, which is what the specification requires. A model would be
useful for drafting prose, never for deciding.

## 6. Reproduction

```
npm install
npm run harvest          # real sanctions, entities, FX, World Bank (network)
node scripts/realize-store.mjs   # real suppliers + indicators into the store
npm test                 # 72 tests
npm run build
npm run dev              # http://127.0.0.1:4780
```

Optional services: `node scripts/start-postgres.mjs` (blocked here by the MSVC
runtime), `.tools/bin/temporal.exe server start-dev` (running).
