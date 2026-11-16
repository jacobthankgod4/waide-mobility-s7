# Content reference: Mappedin model, applied to Waide

Last updated: 16 November 2026

This file records the content model used across the site, where it came from, and what is still missing on each page. It is a working document for editing, not a public page.

Reference site: `mappedin.com` (home, `/platform/`, `/wayfinding/`, `/industries/malls/`, `/pricing/`). The model is used as structure only. No Mappedin copy, customer names, logos, statistics or claims appear on the Waide site.

---

## 1. The Mappedin content model

Nine patterns repeat across their pages.

| # | Pattern | What it does | Example on Mappedin |
|---|---|---|---|
| 1 | Category kicker + one-line promise | Names the product, then makes one claim a buyer can check | "Adaptive wayfinding. The right route for every visitor." |
| 2 | Fact band under the hero | Three or four short numbers with labels, immediately after the actions | "NPS points from wayfinding +20", "digital map interactions 11.8M" |
| 3 | Named proof or a plain statement of scale | Either a customer list or a sentence about who the product is for | Customer logo rows under the hero |
| 4 | One section per capability | A heading, one paragraph, a short list. No combined feature dumps | Platform page splits Experience, Operations, Security |
| 5 | Before / after contrast | Two-column rows: what happens without the product, then with it | "Without a map / With Mappedin" style rows |
| 6 | Scope table | What is included, what is not, what the client must supply | Pricing and platform pages list modules explicitly |
| 7 | Deployment steps | Three or four numbered steps from plans to launch | "Get started" sequences |
| 8 | FAQ | Five to seven questions, written as objections, not marketing | Pricing and product pages |
| 9 | CTA with a next step | One action, plus a sentence about what happens after the click | "Request a demo" + "See it in action" |

Two supporting patterns matter as much as the sections:

- **Every page has one job.** The home page sells the category, the platform page explains the system, industry pages show the venue, pricing answers cost.
- **Claims carry a basis.** Mappedin names the customer behind a number. Waide does the same, but with a pilot and a measurement plan rather than a logo wall.

---

## 2. How Waide adapts it

Waide has one live deployment, so the proof band cannot be a logo wall. The adaptation:

| Mappedin element | Waide version |
|---|---|
| Customer logos | One named pilot: Novare Lekki Mall, Lagos, with scope and dates |
| Headline metrics from customers | The six pilot metrics, defined before launch, published with baseline and sample size |
| Product suite (Experience, Operations, Security) | Three layers: the map, the route, the record. Security and CCTV are explicitly out |
| Industry proof across malls, airports, hospitals | Industry pages describe the problem and the measures, and state that only retail is live |
| Ad and ad-tech modules | Listed under "Not included today" and "What we are not" |
| "Contact sales" | "Request a 20-minute walkthrough", then a scope note with price |

Rules that apply to every page:

1. No claim without a label: measured, observed, modelled, industry estimate, or target.
2. Pilot status is stated where a reader could otherwise assume a commercial rollout.
3. No customer names, logos, certifications or quotes that do not exist.
4. No hardware, integration or AI capability is implied if it is not running.
5. Numbers are either from the pilot scope or from a public source, and the source is named.

---

## 3. Page map: core pages

| Page | Job | Model sections used | Gaps |
|---|---|---|---|
| `index.html` | Sell the category and route to the right page | Hero, fact band, three layers, contrast, venue links, pilot proof, pricing summary, FAQ, CTA | Homepage still describes the category more broadly than the rest of the site; the new industry and platform pages are not linked from every section |
| `solutions.html` | Explain the platform as one product with three jobs | Hero + facts, three layers, contrast, six capabilities, scope table, venue links, deployment steps, FAQ, CTA | Could carry one screenshot or diagram of the dashboard; none exists yet |
| `use-cases.html` | Industry index and guide library | Hero + facts, seven industry sections, per-industry visitor/operator split, measurement note, full guide grid, FAQ, CTA | Only retail has a live deployment; the other six are honest but thin on evidence |
| `platform.html` | Explain how the map is built and measured | Hero + facts, inputs/drawing/indexing, route steps, six-metric table, data collected/not collected, limits table, FAQ, CTA | No architecture diagram; no screenshot of the operator dashboard |
| `pricing.html` | Answer cost and engagement shape | Hero, plan comparison, what is included, pilot terms, FAQ, CTA | Needs a worked example of a scope note; currency and tax treatment still need confirmation |
| `about.html` | Establish who is behind the product | Hero + facts, why we exist, four working rules, team, where we are, what we are not, CTA | Team photos are inconsistent in framing; no company registration or address detail |
| `contact.html` | Convert to a conversation | Hero + facts, form, direct contact, what happens next, three inputs, FAQ, CTA | Form now opens the visitor's email app; no CRM or ticketing behind it |
| `case-study-novare-lekki.html` | Show the pilot in detail | Hero, scope, floors, what is measured, timeline, what it does not prove, CTA | Results are pending; the page must stay a plan, not a result, until the pilot closes |
| `evidence.html` | Publish every claim and its basis | Claims table, label definitions, sources, what is not claimed | Must be updated whenever a page adds a number |

## 4. Page map: capability pages

Rebuilt to the same shell: hero + facts, one job section, contrast or status table, scope, measurement, FAQ, CTA.

| Page | Job | Honest position | Gaps |
|---|---|---|---|
| `smart-wayfinding.html` | The visitor-facing capability | Live at Novare Lekki; QR entry, search, step-free routes, local languages | No route screenshots; no video |
| `interactive-indoor-mapping.html` | The map as an asset | Built from venue plans, walked on site, updated for tenancy changes | No example of a mapped floor; no file-format guidance for CAD |
| `seamless-outdoor-indoor-navigation.html` | The handoff from street to indoor | Link or QR, not an automatic handoff from Google or Apple Maps | Name still says "seamless"; consider renaming the file and adding a redirect |
| `smart-building-integration.html` | Integration status | CSV and manual inputs only; no POS, BMS, CCTV or API | This page replaces the old "smart building" promises, which claimed system integration that does not exist |
| `indoor-proximity-advertising.html` | Explain what is not sold | No ads, no beacons, no ad server. Venue notices only | URL still implies an advertising product; consider a stronger title and internal links |
| `geoconquesting.html` | Explain what is not offered | No competitor targeting, no third-party location data | Low commercial value page; keep for honesty and search, or retire if it dilutes the sitemap |

## 5. Page map: guides

`blog/index.html` is the guide library. Each guide follows: problem, who it affects, what a map changes, what to measure, FAQ, CTA.

| Group | Pages | Gaps |
|---|---|---|
| Retail | `blog/mall-navigation.html`, `blog/parking-garage-navigation.html` | Mall guide predates the pilot and still uses the old voice; needs a rewrite and a link to the case study |
| Healthcare and public | `hospital-navigation`, `library-navigation`, `museum-navigation`, `university-navigation` | Titles vary between "Smart X Navigation with Waide's AI Platform" and question-style headings; unify |
| Transport | `airport-navigation`, `train-station-navigation`, `subway-navigation`, `warehouse-navigation` | Warehouse sits in the transport group by mistake; move to industrial |
| Commercial | `office-building-navigation`, `hotel-navigation`, `casino-navigation` | Casino and hotel guides imply deployments; add a "not yet deployed" line |
| Events | `sports-venue-navigation`, `theme-park-navigation`, `convention-center-navigation`, `cruise-ship-navigation` | Theme park and cruise ship are weak fits for the current product; consider merging or retiring |
| Industrial | `manufacturing-navigation`, `data-center-navigation` | Both make accuracy and ROI claims with no basis |
| Inclusion | `ai-workforce-transformation`, `climate-resilience-disability`, `inclusive-africa-conference-insights` | These are essays, not venue guides; move to a separate "Perspectives" section in the blog index |

Known defects in the guide library:

- `blog/university-navigation.html` has no `<title>` and a h1 copied from a train-station draft.
- Several guides carry the same title pattern, which reads as templated. Rewrite as specific promises.
- Guides written before the pilot use "revolution", "seamless" and "AI-powered" without a basis.

## 6. Page map: team

| Page | Job | Gaps |
|---|---|---|
| `team/jacob-thankgod-kene.html` | Founder profile | Footer markup contains a stray mobile navigation block, and the footer still uses the old copy |
| `team/abdoulaye-diakite.html` | BIM expert profile | Same footer defect |
| `team/fareed-gombilla.html` | UI/UX co-designer profile | Same footer defect |

The three profiles share a template. Fix the footer once and apply it to all three.

## 7. Pages to retire or redirect

| Page | Problem | Recommendation |
|---|---|---|
| `partner.html` | 0 KB empty file | Delete or redirect to `partner-form.html` |
| `phase-one.html`, `phase-two.html`, `phase-three.html` | "100,000+ locations", "all 54 countries" and similar unfounded expansion claims | Retire or rewrite as a single "where we are" page. These are the largest remaining credibility risk on the site |
| `roi-calculator.html`, `roi-calculator-fixed.html`, `roi-calculator-minimal.html` | Three calculators with modelled returns presented as forecasts | Keep one, relabel outputs as illustrative, and add the assumptions to `evidence.html` |
| `test-all-fixes.html`, `test-fixes.html`, `test-updated.html` | Test files in production | Delete |
| `pdf-integration-example.html`, `simple-pdf-demo.html` | Developer demos, no visitor value | Delete or move out of the public root |
| `demo.html` | Duplicate of `contact.html` with a second form | Redirect to `contact.html` or keep as the ad landing page with one form only |
| `login.html`, `signup.html` | No working account system behind them | Remove until there is an account product |

## 8. Priority gaps across the site

1. **Legacy voice in the guide library.** Roughly 20 blog pages still use the pre-audit voice and unverified claims.
2. **Phase pages.** Expansion claims are the biggest factual exposure.
3. **Capability page links.** The new pages are in the footer and the mega menu, but the homepage does not link to `platform.html` or the capability pages in context.
4. **Proof assets.** No screenshots, diagrams or route examples anywhere. Mappedin's pages lean on visuals; Waide currently relies on text.
5. **Team and blog footers.** The standard footer has been applied to the root pages but not to `blog/` and `team/`.
6. **Pricing detail.** A worked scope note would answer the most common sales question better than another comparison table.

## 9. Copy rules for the next edit pass

Applies to every page, including guides and team profiles.

- Headings are labels, not slogans. If a heading could sit on any SaaS site, rewrite it.
- One idea per sentence. Concrete nouns: door, lift, shelf, till, corridor, queue.
- No rhetorical questions. No "not X, but Y" constructions.
- Banned words: till (as checkout), actually, quietly, seamlessly, unlock, empower, revolutionise, leverage, cutting-edge, transform your, holistic, synergy, world-class, state-of-the-art, best-in-class.
- Every claim gets a label and a basis, or it comes out.
- Every page states pilot status where a reader could assume a rollout.
- One CTA wording across the site: "Request a 20-minute walkthrough". Secondary actions are page-specific.
- No dead links. `href="#"` is a defect, not a placeholder.

## 10. Verification checklist per page

- One `h1`, matching the page job.
- Title under 60 characters, description under 160.
- FAQ visible and matching the `FAQPage` JSON-LD.
- Skip link and `<main id="main-content">` present.
- No horizontal overflow at 360, 785 and 1100 px.
- Contrast at least 4.5:1 for body text.
- All internal links resolve; no `href="#"`.
- Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO on rebuilt pages.
