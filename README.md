# Waide Mobility

Static marketing site for **Waide Mobility**, a geospatial and digital systems consultancy based in Lagos, Nigeria. The site positions Waide as a specialist in geospatial engineering, digital twins, GIS platforms, accessible wayfinding and technical advisory for the built environment.

There is no build step, no framework and no client-side routing. It is plain HTML, CSS and a small amount of JavaScript, served from a static host.

---

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Positioning, service overview, flagship pilot, engagement routes |
| Business areas | `business-areas.html` | The seven business areas presented as one portfolio |
| Services | `services.html` | Index of the five service divisions |
| Geospatial engineering and mapping | `service-geospatial-engineering.html` | Survey, digitisation, spatial databases, route networks |
| Digital twins and built-asset information | `service-digital-twins.html` | Multi-level models, space and asset inventories |
| GIS platforms and software | `service-gis-platforms.html` | Web GIS, spatial APIs, PostGIS, access control |
| Accessible mobility and wayfinding | `service-accessible-mobility.html` | Step-free routing, accessible POIs, inclusive interfaces |
| Technical advisory and capacity building | `service-technical-advisory.html` | Requirements, QA, specification, training |
| Projects | `projects.html` | Status-separated project register |
| Novare Lekki case study | `project-novare-lekki.html` | Full project record for the pilot |
| Our approach | `approach.html` | Ten-stage delivery method and review gates |
| Expertise | `expertise.html` | Founder profile, areas of practice, prior experience, collaborators |
| Insights | `insights.html` | Index of the three technical notes |
| Indoor data model | `insight-indoor-spatial-data-model.html` | Technical note |
| JOSM digitisation | `insight-josm-building-digitisation.html` | Technical note |
| Accessible wayfinding | `insight-accessible-wayfinding.html` | Technical note |
| Procurement and partnerships | `procurement.html` | Company overview, document register, enquiry routes |
| Capability statement | `capability-statement.html` | Printable corporate capability statement |
| About Waide | `about.html` | Purpose, focus, operating identity |
| Contact | `contact.html` | Enquiry form and direct contact |
| Technology platform | `platform.html` | Platform note with explicit capability status |
| Not found | `404.html` | Error page |

Retired pages from earlier versions of the site are replaced by lightweight `meta refresh` stubs marked `noindex`. They exist only so old links do not dead-end.

---

## Structure

```
.
├── index.html, services.html, ...    # the pages listed above
├── consultancy.css                   # design system for the consultancy pages (cx-*)
├── consultancy.js                    # mobile nav, form handling, print control
├── sitemap.xml
├── robots.txt
├── site.webmanifest
├── public/
│   ├── waide-logo.png                # source logo
│   ├── favicon-16x16.png             # resized icons
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── og-waide.png                  # 1200x630 Open Graph card
│   ├── Jacob-thankGod.jpg            # founder photograph
│   ├── iac-2025-group.jpg            # Inclusive Africa Conference 2025 photograph
│   └── ...                           # legacy imagery retained from earlier versions
├── blog/                             # retired articles, redirected to insights.html
├── team/                             # retired profiles, redirected to expertise.html
├── README.md
└── CONTENT-VERIFICATION.md           # what is evidenced, what is omitted
```

The consultancy pages load only `consultancy.css`, `consultancy.js` and `public/novare/novare-gallery-data.js`. The former legacy stylesheets and scripts, and the redirect stubs for retired pages, were removed on 23 November 2026; nothing references them.

---

## Local development

Any static file server works. From the repository root:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000/`.

Open `index.html` directly from disk also works, but a server is recommended so relative paths, the manifest and canonical URLs behave as they would in production.

---

## Deployment

The site is static and host-agnostic.

1. Publish the repository root, not a `dist/` folder.
2. Set the host's 404 handler to serve `404.html`.
3. Ensure `.html` extensions resolve (default behaviour on Netlify, Vercel, GitHub Pages and most object-storage hosts).
4. Serve over HTTPS.

`vercel.json` in the repository root is retained from an earlier deployment and can be used or replaced.

### Canonical domain

All canonical URLs, Open Graph URLs and the `sitemap.xml` entries use `https://waidemobility.com`. If the production domain differs, update the `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` tags in each page, plus `sitemap.xml` and `robots.txt`.

---

## Editing content

Pages are hand-written HTML. Shared structure lives in repeated markup rather than includes:

- **Navigation** — inside `<header class="cx-header">` on every page. The current page carries `aria-current="page"`.
- **Footer** — at the end of `<body>`, above `<script src="consultancy.js">`.
- **Head block** — title, description, canonical, robots, favicons, manifest, Open Graph, Twitter card, JSON-LD.

When adding a page:

1. Copy the head block from a comparable page and change the title, description, canonical URL and `og:url`.
2. Use exactly one `<h1>`.
3. Give every section heading a logical level; do not skip from `h1` to `h3`.
4. Add the page to `sitemap.xml`.
5. Add it to the navigation only if it belongs in the primary set.

### Content rules

These are not style preferences; they are constraints on what may be published.

- Do not invent clients, project metrics, dates, certifications, registrations, testimonials, partner logos or office locations.
- Distinguish completed work, active pilot work, work under development and planned functionality. The words *pilot*, *under development* and *planned* have defined meanings on this site.
- Prior employment of the founder is presented as professional history, never as Waide corporate project experience.
- Accessibility implementation is described as implementation and testing. It is not described as certification, and no third-party accessibility certification is claimed.
- Where a figure is published, its basis is stated: digitised feature count, reported floor area, indexed shelf count.

---

## Contact form

`contact.html` does not post to a server. On submit, `consultancy.js` validates the fields, checks a hidden honeypot, composes a `mailto:` link and opens the visitor's email application with the message pre-filled. If the application does not open, the page offers `sales@waidemobility.com` as a direct fallback.

No message content is stored or transmitted by the website itself. The interface states this to the visitor.

To change the destination address, update the `MAILTO` constant at the top of the form handler in `consultancy.js` and the visible address on `contact.html`, `procurement.html`, `capability-statement.html` and the footer.

---

## Accessibility

The site targets WCAG 2.2 AA practice:

- semantic landmarks, one `h1` per page, ordered headings
- skip link to `#main-content`
- visible focus states
- keyboard-operable navigation and form controls
- `aria-expanded` on the mobile menu button, `aria-live` status on the form
- colour contrast checked against the black background
- reduced-motion handling

Lighthouse accessibility, best-practices and SEO scores were verified at 100 on all 21 pages. This is a technical check, not a certification of conformance.

---

## Verification

Before publishing a change:

1. Serve the site locally and open every page.
2. Check for console errors and broken images.
3. Check that each page has one `h1`, a unique title and a unique description.
4. Check internal links and asset paths resolve.
5. Confirm the `contact.html` form validates an empty submit and accepts a completed one.
6. Run Lighthouse on changed pages.

`CONTENT-VERIFICATION.md` records which claims are supported, which are deliberately omitted and why.

---

## Contact

Email: `sales@waidemobility.com`
