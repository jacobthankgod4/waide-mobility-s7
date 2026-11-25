# Publishing procurement automation to waidemobility.com

The marketing site and this console are separate systems. This note records how
they are joined, what crosses the boundary, and how to publish a change.

## Audit of the receiving site

`C:\Users\Admin\Documents\Default Project\waide-mobility-s7-main` is a static
site, not a Next.js app:

| Fact | Consequence |
| --- | --- |
| Pages are hand-written `.html` sharing `consultancy.css` and `consultancy.js` | A new page is a new root-level HTML file, not a route |
| `node stage.mjs` copies an explicit allowlist into `dist/` and **fails the build** if any published `href`/`src` is missing | Any new asset must be reachable from markup or added to `requiredFiles` |
| `requiredFiles` in `stage.mjs` covers files no page links to (certificate PDF, sitemap, `llms.txt`) | The status JSON is added there, so `dist/` is guaranteed to carry it |
| Hosting is Vercel (`api/*.js`) or Netlify (`netlify/functions`, `/api/*` redirect) | There is no database and no writable runtime storage |
| `api/agent-mail.js` and `api/agent-mail-webhook.js` already talk to AgentMail with Svix verification | The site's inbound side already exists; nothing new was needed there |

There is no push, webhook or CMS channel *into* the site. Anything the site
shows has to be a file in the repository, which is why the status is published
as a committed JSON snapshot rather than fetched from a console API. That
console runs on a laptop at `127.0.0.1:4780`; it is not reachable from the
public internet, and exposing it would publish an unauthenticated console.

## What crosses the boundary

`scripts/publish-automation.mjs` writes one file:

```
<site repo>/automation-status.json      ← read by /automation.html
```

It contains only:

- control coverage, read from the engine modules themselves (`CHECK_DEFINITIONS`,
  `CAPABILITIES`, `INTENTS`) plus the ledger's own `verifyChain` result;
- reference-data currency from `data/real/manifest.json` — sanctions totals and
  harvest date, LEI records retrieved and imported, FX source and date.

It never contains supplier names, buyer names, documents, prices, margins,
bank details, correspondence or approvals. `assertPublicSafe` enforces this:
every key must be on `PUBLIC_KEYS`, strings longer than 400 characters are
refused, e-mail addresses are refused, and any string containing a supplier
name from the store is refused. Widening the snapshot therefore requires
editing the allowlist and the test, which is the point.

## Publish a change

```bash
# in the console; needs data/real/manifest.json (npm run harvest)
npm run publish:site

# confirm what is already published
node scripts/publish-automation.mjs --check

# in the site repository
node stage.mjs            # also verifies every local reference resolves
git add -A && git commit -m "Update procurement automation status"
git push
```

`npm run publish:site` prints the figures it wrote. If the store or manifest is
missing it fails rather than writing a partial file.

## The page

`automation.html` carries the last published figures in its markup, so it is
complete without JavaScript and does not show an empty panel when the fetch
fails. `consultancy.js` refreshes those figures from the JSON when the file can
be read, and marks the block `data-automation-state="current"`; on failure it
marks it `unavailable` and leaves the markup alone.

The page states controls, the sequence a request passes through, and what the
system refuses. It makes no certification claim.

## Checks run

- `node stage.mjs` → `Staged 54 pages and 206 files (40.5 MB)`, link check passed.
- `/automation.html` → 200 `text/html`, `/automation-status.json` → 200
  `application/json`.
- `npm test` → 129/129, including nine tests that hold the snapshot to its
  allowlist and refuse an added key, an e-mail address and a real supplier name.
