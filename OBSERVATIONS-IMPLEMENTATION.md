# Waide Mobility — Homepage rework and business review

**Date:** 15 November 2026
**Scope:** Homepage messaging, information hierarchy, claim substantiation, and commercial positioning.
**Backups:** stored outside the deployable folder in `..\_waide-backups\` (`index.original.html`, `styles.original.css`).

---

## 1. What changed, mapped to the observations

| Observation | Change made |
|---|---|
| **Opening headline too technical** | New H1: *“Know your space. Guide every visitor. Understand what happens inside.”* The first screen now says what Waide does in plain language, with a one-sentence explanation underneath. “Spatial intelligence infrastructure” is no longer the first thing a visitor reads. |
| **Too much information / repetition** | Homepage cut from **130 KB to 46 KB** and from 16 sections to 11. Removed the duplicate “problem” blocks, the second partner CTA section, the eight-card benefits wall, the “Why Now” section, the anonymous testimonials, and the 18-item industries carousel. Each message now appears once. |
| **Audience not distinguished** | New “Who are you here as?” section immediately after the hero: one path for visitors, one for owners/operators, each with its own language and CTA. |
| **Claims need evidence** | The 15–20% figure is labelled **Industry estimate**; the US$5–7M figure is labelled **Waide model** and linked to a new [evidence register](evidence.html) that publishes the formula, assumptions, and what would verify each claim. |
| **Pilot vs commercial deployment confusion** | The hero states “active pilot deployment — measured commercial results are still being collected.” A two-column proof section separates **Live today** from **Still being proven**. Phase Two and Phase Three copy no longer says commercial deployments are “proven”. |
| **Positioning beyond indoor navigation** | New “One system. Three layers.” section: *Map the space*, *Guide the visitor*, *Understand the movement*, with the line: “Navigation is the interface. The spatial data underneath it is the asset.” |
| **Suggested first-screen direction** | Implemented with the three capability labels (Indoor navigation / Digital twins / Spatial analytics), a proof strip for Novare Lekki, and two primary CTAs. |

---

## 2. New homepage flow

1. **Hero** — plain-language promise, audience-neutral, with pilot status.
2. **Audience split** — visitor vs owner/operator.
3. **Problem** — one explanation, three labelled facts.
4. **What Waide is** — three layers, one system.
5. **Proof** — Novare Lekki: four measured stats, live vs still-being-proven, video.
6. **How it works** — three steps.
7. **Outcomes** — four things an operator can act on.
8. **Industries** — six compact entries, not eighteen.
9. **Accessibility** — one short band.
10. **FAQ** — six buyer questions instead of eighteen.
11. **Final CTA** — “Start with your floor plan.”

The page can now be understood in the first screen and skimmed in about a minute.

---

## 3. Claim handling

### New page: `evidence.html`

It contains:

- A legend for **Measured / Observed / Model / Industry estimate**.
- A deployment-status table for Novare Lekki, including what is live, what is in progress, and what has not started.
- A claim register with the basis and verification path for each figure.
- The actual formula behind US$5–7M, including the assumptions and the admission that it may overstate the recoverable amount.
- An explicit “What we do not claim” list.
- The metrics the six-month pilot is designed to produce.

### Claims removed or softened on the homepage

- Removed “10–20× activation rate” (no published basis).
- Removed “25 million Nigerians” and “certified accessible navigation” (not independently certified).
- Removed anonymous testimonials presented as partner quotes.
- Removed “We’ve already done this … live today” in favour of pilot-status language.
- Removed the “commercial deployments proven” claim from the timeline and from Phase Two/Three copy.

---

## 4. Business-consultant assessment

The site now explains the product and the proposition. It does not yet *close* a commercial buyer. The remaining gaps, in order of revenue impact:

### 4.1 There is still no measured outcome

The strongest possible asset is a before/after result from Novare Lekki: search-to-shelf completion, zone traffic change, or basket lift. Until that exists, every commercial claim is a model. **This should be the single priority for the next 90 days.** Publish even a small, honest result: “X searches completed, Y% reached the shelf, Z% of sessions ended in a drop-off.”

### 4.2 The pricing page undermines the new credibility

`pricing.html` still contains:

- A countdown-style offer (“setup fees waived for next 48 hours only”).
- An expired “Price increases January 1st, 2025” warning.
- Unsourced revenue claims (“$2.5M+”, “$3.8M+”, “89% choose us”).
- A price conflict: the homepage FAQ previously said $299; the pricing page says $399 for the same tier.

A buyer who reads the evidence register and then the pricing page will trust the site less, not more. The pricing page should be rewritten in the same register: what is included, what is not, what the pilot costs, and what a rollout costs.

### 4.3 The commercial model is still implicit

The homepage says what the product does and who it is for, but not explicitly **who pays, for what, and on what basis**. Add one short commercial section:

- **Pilot:** one venue, fixed scope, fixed fee, agreed evaluation metrics.
- **Deployment:** per venue, based on floor area and modules.
- **Portfolio:** multi-site agreement with shared reporting.

Even without prices, naming the three buying routes makes the business legible to an asset manager.

### 4.4 Proof is still self-referential

The video is a product walkthrough, not a customer outcome. The next proof assets should be:

1. A two-page Novare Lekki case study (scope, method, what was measured, what was learned, what changed).
2. One named, permissioned quote from Novare management or a tenant.
3. A sample weekly KPI report and a sample 180-day evaluation summary (redacted).

### 4.5 The conversion path is split

“Request Demo” goes to `demo.html`; “Request a walkthrough” goes to `contact.html`; “Discuss Your Property” is a `mailto:`. Three different actions for the same buyer. Pick one primary conversion (a scheduled 20-minute walkthrough) and make every CTA lead to it. Keep email as a fallback, not a parallel path.

### 4.6 The accessibility story is strong but under-evidenced

Accessibility is a genuine differentiator, especially in African retail. It needs one proof point: a user test, a partner letter, or a measured route-completion result. “Built in, not bolted on” is a claim until someone outside Waide validates it.

---

## 5. Recommended sequence

### Next 30 days

- Rewrite `pricing.html` to remove fake urgency and unsourced revenue figures; resolve the $299/$399 conflict.
- Choose one primary CTA and apply it across the site.
- Add the three buying routes (pilot / single venue / portfolio) to the homepage.
- Publish a one-page Novare Lekki status note with the pilot's start date and scope.

### Next 60 days

- Collect and publish the first pilot metrics (even if modest).
- Record a 60–90 second interview with Novare management or a tenant.
- Replace the product walkthrough with a 90-second “problem → deployment → result” video.

### Next 90 days

- Publish the 180-day evaluation summary.
- Turn it into a downloadable case study and a sales one-pager.
- Add a second vertical proof point (hospital or airport) only when there is a real deployment to show.

---

## 6. Technical changes

- Repaired a pre-existing truncation in `index.html`: the file ended mid-`<script>` with no `</body>` or `</html>`. The document is now valid and closes correctly.
- Added a skip link and anchor scroll offset for keyboard users.
- Fixed navigation wrapping between 768 px and 1024 px (the brand and “Use Cases” previously broke onto two lines).
- Replaced the auto-loading YouTube iframe with a click-to-play facade: faster first load, no third-party cookies until the visitor chooses to watch.
- Added `evidence.html` to `sitemap.xml` and to the footer.
- Updated title, meta description, Open Graph and Twitter metadata to match the new positioning.
- Added only scoped `hp-` / `ev-` CSS classes; other pages are unaffected by the new styles.
- Lighthouse on both pages: **Accessibility 100, Best Practices 100, SEO 100**; no console errors; no broken local links.

---

## 7. Files changed

| File | Change |
|---|---|
| `index.html` | Homepage rebuilt; commercial routes section added; metadata updated; truncated tail repaired. |
| `evidence.html` | **New.** Claims register and pilot status. |
| `case-study-novare-lekki.html` | **New.** Pilot scope, deployment status, measurement plan, quote policy. |
| `pricing.html` | Rebuilt around pilot / single-venue / portfolio; credibility issues removed. |
| `styles.css` | Homepage, evidence and commercial-route styles; nav tablet fix; skip link. |
| `sitemap.xml` | Homepage and pricing dates updated; evidence and case study pages added. |
| All 50 HTML files | “Request Demo” / “Book a Demo” → “Request a walkthrough”; `demo.html` → `contact.html`. |
| `phase-two.html` | “Proven methodologies” → methodology being tested; heading corrected. |
| `phase-three.html` | “Proven success” → building on the Lagos pilot. |
| `..\_waide-backups\index.original.html` | Backup of the original homepage, kept outside the deployable folder. |
| `..\_waide-backups\styles.original.css` | Backup of the original stylesheet. |

---

## 8. One-line verdict

The foundation was always there. The homepage now says what Waide does, who it is for, what is proven, and what to do next — in that order. The next gain is not another redesign; it is **one measured result** and a pricing page that deserves the same trust as the evidence register.

---

## 9. Round two: the six credibility gaps

The business-consultant review identified six gaps. All six now have a structural fix on the site. Two of them cannot be fully closed without data that only the pilot can produce.

| Gap | Fix |
|---|---|
| **No measured pilot outcome** | New `case-study-novare-lekki.html`: scope, deployment status (live / in progress / not started), a metric-by-metric measurement plan with definitions, baselines and reporting points, and an explicit “no results yet” statement. The page is the permanent home for the first real numbers. |
| **`pricing.html` undermined trust** | Rewritten from scratch. Removed the 48-hour countdown, the expired January 2025 price warning, the “2,847 venues / 153 spots” scarcity copy, the 40%/45%/60%/85%/89% benefit claims, the $2.5M/$3.8M figures, 98.7% accuracy, 3.2× ROI, and the SOC 2 / GDPR badges. Replaced with three engagement routes, indicative rates, a clear included/not-included split, and the four inputs that build a quote. |
| **Commercial model was implicit** | New homepage section “Three ways to buy” — Pilot, Single venue, Portfolio — each with who it is for, what it includes, a price cue and a link to the matching pricing anchor. |
| **Three conversion actions** | Every “Request Demo” and “Book a Demo” across all 50 HTML files now reads “Request a walkthrough” and points to `contact.html`. The footer mailto button was replaced. Email remains as plain-text fallback, not a parallel CTA. |
| **Self-referential proof** | The pilot page separates what is deployed from what is proven, and replaces a fabricated testimonial with a written policy: no partner quote is published until the named person has approved it in writing. The video stays as a product walkthrough and is labelled as one. |
| **Unmeasured “15–20% / US$5–7M”** | Unchanged from round one, but now cross-linked from the pricing page and the pilot page: industry estimate and illustrative model, with the formula and the instruction not to quote them as results. |

### What still needs the business, not the website

1. **Pilot results.** The case study has the table; it needs the numbers. Publish even a partial 90-day read.
2. **A permissioned quote.** The page states plainly why there isn't one. One approved sentence from Novare management is worth more than any copy change.
3. **A decision on published prices.** The US$399 / US$1,199 figures came from the existing site. They are now labelled indicative. Confirm they are real before this goes live.

### Round-two technical notes

- `pricing.html`: rebuilt body, new metadata and canonical URL, single `<main>` landmark, heading order corrected, dead popup markup and its JavaScript removed, footer links repaired, unsupported trust badges removed.
- `case-study-novare-lekki.html`: new page, reuses the site nav and footer, two data tables, no external images, no JavaScript.
- Navigation: the longer CTA label caused a 21 px overflow at 785 px. Tablet nav now uses tighter padding and type; verified at 785 px with zero horizontal overflow.
- Lighthouse after round two: `pricing.html` and `case-study-novare-lekki.html` both **100 / 100 / 100** (accessibility, best practices, SEO); homepage remains 100 / 100 / 100. No console errors. All local links resolve.
- `sitemap.xml`: case study added, pricing and homepage dates updated to 2026-11-15.

---

## 10. Round three: the copy audit

The content was accurate but read like it was written by a machine. The fix was sentence-level, not structural: shorter sentences, concrete nouns, and no rhetorical balancing acts.

### What was cut, and why

| Pattern | Example before | Rewrite |
|---|---|---|
| Rhetorical question aimed at the reader | “Who are you here as?” | “Visiting, or running the venue?” |
| Essay-style framing | “Waide is used by people walking through a building and by the teams responsible for it. Those are two different questions, so start with the one that is yours.” | “Both use the same map. Visitors need directions. Operators need the data behind them.” |
| False antithesis (“not X, but Y”) | “Defend your asset story.” “Anchor spillover measured rather than assumed.” | “Make the case to your board.” “Anchor spillover measured from real movement.” |
| Soft intensifiers | “actually”, “quietly”, “finally” | Removed. |
| British retail metaphor that does not travel | “before it ever reaches your till” | “before it ever reaches your shop” |
| Consultant headings | “Choose the route that matches your decision.” “What the fee covers — and what it doesn’t.” “Pricing questions, answered plainly.” | “Pick the route that fits where you are.” “Included and not included.” “Common questions” |
| Decorative triads | “From floor plan to live intelligence.” | “How a deployment works” |
| Slogan headings on the pilot page | “A hard building, not a showroom.” “The numbers this pilot is built to produce.” “Why there is no quote here yet.” | “A working mall, not a demo.” “What the pilot will measure” “No partner quote yet” |

### Rules now applied to new copy

1. Subject, verb, object. If a sentence needs a comma to hold it together, split it.
2. No “not just”, “more than just”, “isn’t just”. Say the thing.
3. No adverbs doing the work of evidence: “actually”, “quietly”, “seamlessly”, “truly”.
4. Headings are labels, not arguments. “Common questions”, not “The things buyers ask first.”
5. Every number keeps its label: measured, observed, model, industry estimate.
6. Second person only when giving an instruction. No “you” used to flatter the reader.

### Still outstanding elsewhere on the site

The four rewritten pages are clean. The older pages were not touched in this round, and carry the previous house style:

| Phrase | Occurrences across legacy pages |
|---|---|
| `seamless` | 99 |
| `revolution` | 33 |
| `transform your` | 24 |
| `leverage` | 18 |
| `not just` | 11 |
| `cutting-edge` | 10 |
| `empower` | 9 |
| `isn't just` | 7 |

These need a page-by-page rewrite, not a find-and-replace: “seamless” usually replaces a sentence that should describe what actually happens. The highest-value targets are `solutions.html`, `use-cases.html`, the industry pages and the blog index, because they carry the most search traffic.

### Round-three verification

- Lighthouse on `index.html`, `evidence.html`, `pricing.html` and `case-study-novare-lekki.html`: **100 / 100 / 100**, zero accessibility failures.
- No horizontal overflow at 785 px or 1100 px.
- No console errors.
- All local links resolve; `/sitemap.xml` returns 200.
- Zero remaining occurrences of `till`, `actually`, `quietly`, `seamless`, `unlock`, `empower`, `revolution`, `leverage`, `cutting-edge`, `transform your`, `not just`, `isn't just`, `more than just`, `we believe`, `holistic` or `synergy` in the four rewritten pages.

## 11. Round four: Mappedin content model across the site

Reference read: `mappedin.com` home, `/platform/`, `/wayfinding/`, `/industries/malls/`, `/pricing/`. Structure only; no Mappedin copy, customers, logos or statistics were reused.

### What changed

| File | Change |
|---|---|
| `solutions.html` | Rebuilt: hero + fact band, three layers (map, route, record), without/with contrast, six capabilities, scope table, venue links, deployment steps, six-question FAQ, CTA |
| `use-cases.html` | Rebuilt as an industries index: seven venue sections with visitor/operator split, full guide library, five-question FAQ |
| `platform.html` | Rebuilt from the orphaned developer/API page into "how the map is built": inputs, drawing, indexing, route steps, six-metric table, data collected/not collected, limits, FAQ |
| `about.html` | Rebuilt: 2019 / 5 people / 1 pilot facts, why we exist, four working rules, five team cards, where we are, what we are not |
| `contact.html` | Rebuilt: plain hero, honest direct contacts (Lagos, Nairobi partnership), what-happens-next steps, FAQ; removed the invented "800 deployments", US phone number and San Francisco address. The form now opens the visitor's email app instead of faking a submission |
| Six capability pages | Rebuilt to one template: `smart-wayfinding`, `interactive-indoor-mapping`, `seamless-outdoor-indoor-navigation`, `smart-building-integration`, `indoor-proximity-advertising`, `geoconquesting`. Advertising and geoconquesting are now explicit "not offered" pages rather than promises |
| `styles.css` | Added the `pg-*` page kit, contact page additions, and non-heading labels for nav/footer (`dropdown-heading`, `link-group-title`) |
| `CONTENT-REFERENCE.md` | New: Mappedin model, Waide adaptation rules, per-page section map and gaps, pages to retire, copy rules, verification checklist |
| Root footers | Replaced the "powered by artificial intelligence" footer and its dead `href="#"` links on root pages with the standard honest footer |

### New shared page structure

Every rebuilt page follows the same order:

1. Kicker and one-sentence promise
2. Actions (one primary CTA, one secondary)
3. Fact band with labelled numbers
4. One section per idea, never a feature dump
5. Before/after contrast table or a status table
6. Scope: what is included and what is not
7. Measurement or deployment steps
8. Five or six FAQs written as objections
9. CTA with what happens next

### What was deliberately left out

Mappedin's security, CCTV, leasing and ad-tech modules are not copied. Each is either listed under "Not included today" or given its own page explaining why Waide does not offer it. That keeps the site specific without implying capability that does not exist.

### Round-four verification

- Lighthouse on the eleven rebuilt pages (`solutions`, `use-cases`, `platform`, `about`, `contact`, and the six capability pages): **100 accessibility, 100 best practices, 100 SEO**, zero failures.
- No horizontal overflow at the measured desktop width; all form field IDs intact on `contact.html`.
- No console errors; no dead `href="#"` on rebuilt pages.
- All local links resolve except two known legacy cases recorded in `CONTENT-REFERENCE.md` (`roi-calculator.html` links to three pages that do not exist, and one blog image is missing).
- FAQ visible text matches the `FAQPage` JSON-LD on all six capability pages, `solutions.html`, `use-cases.html` and `platform.html`.

### Still outstanding

1. Blog and team footers still use the old copy and, on team pages, contain a stray mobile navigation block inside the footer.
2. Roughly 20 blog guides still use the pre-audit voice.
3. `phase-one.html`, `phase-two.html` and `phase-three.html` still carry unfounded expansion claims ("100,000+ locations", "all 54 countries"). These are the largest remaining credibility risk.
4. No screenshots, diagrams or route examples anywhere on the site. The new pages are text-only.
5. `seamless-outdoor-indoor-navigation.html` keeps its old filename while the copy now says the handoff is a tap or a scan, not seamless. Rename with a redirect if the URL is not yet indexed.
