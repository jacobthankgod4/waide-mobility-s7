# Waide Procurement OS (WPOS)

An evidence-driven, authority-bounded operating system for asset-light international procurement — built from the 100-page master build prompt and governed by the **Waide Autonomous Operations Constitution (WAOC)**.

The system discovers opportunities, analyses solicitation requirements, qualifies suppliers, prices on full contribution margin, models peak cash exposure, routes every consequential action to a named human authority, coordinates fulfilment, and reconciles finance. It **holds rather than guesses**: an unknown mandatory fact is a blocker, never a pass.

> **Dataset warning — two modes, both stated on screen.**
>
> The seeded store (`npm run seed`) is a synthetic click-through demo: invented companies, prices and approvals, used to exercise every gate.
>
> The realised store (`npm run realize`) replaces the suppliers with **41 real legal entities from the GLEIF LEI registry**, screens each one against the **real OFAC SDN and UN consolidated lists** (20,636 entries, harvested with URL + SHA-256 provenance in `data/real/manifest.json`), and attaches **real FX rates** (open.er-api.com) and **World Bank indicators** to the country profiles. Those entities arrive at S0 with no admission checks performed, so the console demonstrates refusal rather than competence: nothing can be bid, ordered or paid until a human qualifies them.
>
> What is never synthetic and never faked: sanctions hits, FX, country indicators, document extraction and every gate decision. What is still absent: real ISO/NAFDAC/SONCAP certificates (they are only ever what an uploaded document proves), real bank details, and real approvals. The eight country risk factors remain desk judgements and are labelled as such.

## Run it

A portable Node runtime ships in this repo at `.tools/` (no system install was available).

```bash
export PATH="$PWD/.tools/node-v22.23.5-win-x64:$PATH"

npm install          # first time only
npm run seed         # regenerate data/runtime/store.json from the seed modules
npm run dev          # http://127.0.0.1:4780
```

Checks:

```bash
npm run typecheck    # TypeScript, strict
npm test             # 119 deterministic engine, extraction and write-path tests (node:test)
npm run verify       # drives the real server actions end-to-end (requires npm run dev)
npm run build        # production build, all routes
```

`npm run realize` replaces the synthetic suppliers with 41 real GLEIF legal entities, screened on import against the real OFAC SDN and UN consolidated lists. Those entities arrive at S0 with only registration and sanctions evidenced, so the console then demonstrates refusal: no bid, no PO and no payment can proceed until a human qualifies them. The synthetic seed is the click-through demo; the realised store is the evidence-discipline demo.

## The write path

The console is not read-only. Four consequential actions execute through server actions that call the deterministic engines before persisting anything:

| Action | Gate | Refusal demonstrated |
| --- | --- | --- |
| Supplier admission (S0→S3) | `admission.mjs`: every mandatory requirement evidenced; S3 is dual-control | Missing evidence blocks promotion; the same authority cannot decide twice |
| Purchase-order issuance | `purchaseOrder.mjs`: S2/S3 supplier, live contract, real headroom, back-to-back obligations, delegated authority | A procurement officer's own commitment is held for MD approval; a duplicate PO is refused |
| Payment preparation and release | `paymentControl.mjs`: three-way match, duplicate and beneficiary checks, prepare/approve/release separation | An unmatched or PO-less invoice cannot be prepared; release is refused before approval |
| Bid approval and submission | `bidSubmission.mjs` + `gates.mjs`: 16-check gate, MD-only approval, official receipt | Non-MD approval refused; submission without a receipt leaves the stage at `bid_approved` |

Every accepted or refused action writes a hash-chained ledger event. Approvals are bound to the payload they authorised and expire after 72 hours; a changed amount, quantity or beneficiary voids the decision rather than inheriting it. `npm run verify` walks all four flows over HTTP and asserts both the refusal and the release paths (63 assertions).

## What is actually built

| Area | Control |
| --- | --- |
| Authority | Capability matrix over 26 actions; AI has zero signature, approval, payment-release or guarantee authority; dual approval above threshold; payload-hash binding and 72h expiry |
| Evidence | Vault with source, entity, issue/expiry, access class, permitted use, hash; freshness lifecycle; cross-document identity conflict detection; partner-vs-own performance attribution |
| Margin | 12-line direct cost ledger, sector target/floor decisioning, risk-adjusted margin, provisional flag when any direct cost is unknown |
| Cash | Time-phased peak funding requirement, cleared-vs-expected inflow separation, four stress scenarios, funding-instrument admissibility |
| Bid gate | 16 deterministic checks → `bid_ready` / `hold` / `no_bid` |
| Suppliers | S0–S3 lifecycle, 16-point admission checklist, screening with false-positive / potential / confirmed discipline and named resolution |
| Communications | 21 intent classes; eight outbound checks; inbound prompt-injection, bank-change and exfiltration quarantine |
| Contracts | Clause-by-clause obligation coverage, prohibited commitments, JV joint-liability analysis, Incoterms 2020 matrix, Nigeria Form M/SONCAP/NAFDAC release gate |
| Finance | Three-way match, duplicate detection, beneficiary change control, read/prepare/release separation |
| Governance | Hash-chained append-only audit ledger with tamper detection and per-subject reconstruction |

Screens: `/` dashboard · `/opportunities` · `/opportunities/[id]` · `/pricing/[id]` · `/suppliers` · `/suppliers/[id]` · `/evidence` · `/approvals` · `/communications` · `/contracts` · `/contracts/[id]` · `/finance` · `/compliance` · `/policies` · `/audit` · `/spec-audit` · `/roadmap`.

## Documents

- [`docs/PHASED_BUILD_PLAN.md`](docs/PHASED_BUILD_PLAN.md) — the 50 gated phases with status and gates.
- [`docs/AUDIT_100_PAGES.md`](docs/AUDIT_100_PAGES.md) — page-by-page audit of all 100 pages with open gaps and an automated omission check.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — components, control flow, deviations from the specified stack and why.

Regenerate the first two from the same data the app renders:

```bash
node scripts/render-docs.mjs
```

## Deviations, stated plainly

The specification prescribes Python/FastAPI, Temporal, PostgreSQL, Keycloak, S3, Docling, Playwright and the OpenAI Agents SDK. This build runs **entirely locally with no external services**, so it implements the controlling logic and console and marks the infrastructure as staged rather than simulating it:

- Persistence is a JSON document store behind the same repository boundary a SQL adapter would use — not PostgreSQL.
- Durable workflow is a resumable state machine in application code — not Temporal. No timers, signals or compensation rollback.
- The domain layer is JavaScript (`.mjs`) so the identical modules run under `node:test` without a build step; the UI is strict TypeScript.
- Session identity is a cookie with role switching — not Keycloak/MFA.
- No model is called; no PDF parsing, portal automation, email provider or object storage is wired.

What that means: the **policy, arithmetic and refusal behaviour are real and tested**; the operational integrations are not. See `docs/AUDIT_100_PAGES.md` for the page-level status of each.
