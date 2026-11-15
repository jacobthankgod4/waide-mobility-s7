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
| **Commercial model was implicit** | New homepage section “Three routes. One starting point.” — Pilot, Single venue, Portfolio — each with who it is for, what it includes, a price cue and a link to the matching pricing anchor. |
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
