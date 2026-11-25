# Source copy inside the Waide Mobility site

This directory is the Waide Procurement OS console, committed here so the
automation behind `automation.html` lives in the same repository as the site
that describes it. It is **not** built or deployed by the site: Netlify stages
`dist/` and Vercel builds the explicitly listed files in `vercel.json`, so
nothing in this folder is served in production.

## What is committed, and what is not

Committed: application routes and components, engine modules, scripts, tests,
documentation, sample tender documents, and the package manifests.

Not committed:

| Path | Why | How to restore |
| --- | --- | --- |
| `data/real/` | Harvested sanctions, LEI entity, FX and country-risk data (8 MB), plus real legal entity names | `npm run harvest-real-data` |
| `data/runtime/` | The live store: real suppliers, prices, approvals, ledger | `npm run seed` (synthetic) or `npm run realize` (real reference data) |
| `.env.local`, `.tools/` | Credentials and a portable Node runtime | `.env.example`, any Node 22 |

`data/samples/` stays because `tests/extraction.test.mjs` reads those tenders.

## Run it

```bash
cd procurement-os
npm install
npm run seed
npm run dev        # http://127.0.0.1:4780
```

`npm test` needs `npm run harvest-real-data` first, because the sanctions
screening tests read `data/real/sanctions.json`.

## The public boundary

`scripts/publish-automation.mjs` is what publishes to the site, and it reads
only control coverage and reference-data currency — gate checks, capabilities,
intents, sanctions and registry counts, FX as-of. It refuses to emit supplier
or buyer names and e-mail addresses, and it is what produced the committed
`../automation-status.json`.
