# Content verification record

This file records the factual basis for claims made on the Waide Mobility website, and the material that was deliberately left out. It exists so that anyone editing the site can tell the difference between an evidenced statement and an assumption.

Last reviewed: 16 November 2026.

---

## 1. Rules applied

1. If a fact could not be evidenced, it was not published.
2. If a fact was partially evidenced, it was published with its basis stated.
3. Completed, active, under-development and planned work are labelled separately.
4. Prior employment is never described as Waide corporate project experience.
5. Implementing accessibility is never described as certifying it.
6. No client name, logo, testimonial, metric, date or certification is published without permission and evidence.

---

## 2. Verified facts used on the site

| Fact | Where it appears | Basis |
| --- | --- | --- |
| Waide Mobility is based in Lagos, Nigeria | Home, About, Contact, Procurement, Capability statement, footer, JSON-LD | Stated company location |
| Contact address is `sales@waidemobility.com` | Contact, Procurement, Capability statement, footer | Verified mailbox in use |
| Founder and lead consultant is ThankGod Jacob Chibueze | Expertise, About, Procurement, Capability statement, article bylines, JSON-LD | Confirmed identity and role |
| Role title: Founder & Lead Geospatial and Digital Systems Consultant | Expertise, Procurement, Capability statement, JSON-LD | Confirmed role title |
| Novare Lekki Mall, Lekki, Lagos, Nigeria | Projects, case study, procurement register | Named project |
| Approx. 22,000 m² in scope | Projects, case study, capability statement, home | Reported mall area covered by the mapping scope |
| Three mapped levels: Ground floor, Level 1, Parking Level A | Case study, projects | Mapped scope |
| 150+ store footprints digitised | Projects, case study, home, capability statement | Count of digitised features |
| 1,000+ parking bays in the vehicle network | Projects, case study, home, capability statement | Count of digitised bays |
| 900 Shoprite shelves indexed | Projects, case study, home, capability statement | Count of indexed shelf positions |
| Separate pedestrian and vehicle networks | Projects, case study, services, platform | Project method |
| JOSM used for indoor digitisation | Case study, insight article, capability statement | Project method |
| Dijkstra shortest-path routing | Case study, platform, capability statement | Project method |
| Step-free route layer validated on site | Projects, case study, accessible mobility service | Project activity |
| Six-month pilot | Projects, case study, procurement register | Stated pilot duration |
| Browser and QR access, no app install required for visitor wayfinding | Platform, accessible mobility service, case study | Project implementation |
| Pilot outcome metrics are not published | Projects, case study, platform | No measured results released |
| Named collaborators: Abdoulaye Diakite PhD (BIM, Sydney), Fareed Gombilla (UI/UX co-design, accessibility), Kaunda Bill and Charity Adhiambo (Najimudu Empowerment Initiative, Kenya) | Expertise, Procurement, capability statement | Confirmed collaborators |
| Prior roles: Desby.app (CTO & Full-Stack Engineer), Perazim Proptee Ltd. (Senior Full-Stack Engineer), STEM Inclusive Africa (Technical Programme Lead), Techbionics (Senior Software Engineer) | Expertise, capability statement | Founder's professional history |
| Photograph `public/iac-2025-group.jpg` shows the Inclusive Africa Conference 2025 | About | Event photograph |
| Photograph `public/Jacob-thankGod.jpg` is the founder portrait | Expertise | Supplied portrait |

---

## 3. Figures and their stated basis

Every number published on the site carries an explanation of what it counts:

- **22,000 m²** — the reported mall area covered by the mapping scope. It is not a surveyed gross leasable area and is not presented as one.
- **150+ stores** — digitised store footprints, not current tenancies.
- **1,000+ bays** — parking bays included in the vehicle routing network.
- **900 shelves** — shelf positions indexed inside the anchor supermarket only.
- **Six months** — the stated pilot duration. Exact start and end dates are not published.

None of these is a revenue, adoption, satisfaction or operational-performance result.

---

## 4. Deliberately omitted

The following were considered and excluded because they could not be evidenced or would have overstated the company.

| Omitted | Reason |
| --- | --- |
| Founding year | Not verified for publication |
| Legal suffix (Ltd, Inc, LLC) and registration number | Not verified; no legal identity is asserted |
| Company registration or tax identifiers | Not verified |
| ISO, quality or accessibility certifications | None held or evidenced |
| Approved-supplier or vendor status | None evidenced |
| Audited accounts, turnover, headcount | Not available for publication |
| Client logos and testimonial quotes | No written permission |
| Named client contacts | Confidential |
| Pilot outcome metrics (route completion, search success, dwell time) | Not measured and released |
| Exact project dates | Not published |
| Cinema, tenant-count and other venue details beyond verified scope | Removed during review; not confirmed |
| Additional venues or deployments | None evidenced |
| Offices or staff outside Lagos | None exist |
| Downloadable PDF capability statement | No final document exists; a printable HTML version is provided instead |
| Telephone number and street address | Not verified |
| Newsletter signup, gated downloads, demo credentials | No functioning backend or authorised demo |
| Awards, press mentions, partner logos | Not evidenced |

If any of these become available with evidence, they can be added — with the same basis statement.

---

## 5. Status language

The site uses four status words with fixed meanings.

| Term | Meaning |
| --- | --- |
| **Completed / Delivered** | Built and verified for the stated scope |
| **Pilot** | In use for the mapped deployment, without published outcome metrics |
| **Under development** | Being built, not released |
| **Planned** | Designed but not started |

Examples of correct use:

- The indoor spatial dataset, routing networks and shelf index are *delivered* for the mapped scope.
- The platform is at *pilot* stage.
- Operator analytics and multi-venue tenancy are *under development*.
- Sensor and building-system integration is *planned*.

---

## 6. Prior experience vs. Waide projects

`expertise.html` lists the founder's prior employers and roles in a table explicitly labelled as professional history. The page states that none of these organisations is presented as a Waide client unless a separate Waide engagement exists.

The same distinction is repeated in `capability-statement.html`. The Projects page deliberately does not list prior employment.

No dates, contract values or client names for prior roles are published.

---

## 7. Accessibility claims

The site states:

- accessible routes are implemented and tested;
- the Novare step-free route layer was validated on site;
- interface work follows established web accessibility practice;
- no third-party accessibility certification is claimed;
- a route check is not an audit.

The site does **not** state that any venue, product or page is "WCAG certified", "fully accessible" or "audited by a third party".

Lighthouse scores of 100 for accessibility, best practices and SEO were measured on the 21 published pages at an 800 px viewport. This is a technical test result, not a conformance certification.

---

## 8. Document register

`procurement.html` links only to pages that exist:

| Document | Location |
| --- | --- |
| Capability statement | `capability-statement.html` (printable HTML) |
| Project experience register | `projects.html` |
| Novare Lekki project record | `project-novare-lekki.html` |
| Personnel profile | `expertise.html` |
| Technical method notes | `insights.html` and the three article pages |
| Quality and data-management summary | `approach.html` |

No placeholder links, empty PDFs or "coming soon" items are published.

---

## 9. Retired content

Earlier versions of the site contained pages that could not be supported:

- pricing and ROI calculator pages (no verified pricing model)
- phase-one/two/three roadmap pages (no verified dates)
- demo and login pages (no public demo environment)
- geoconquesting and proximity-advertising pages (outside the consultancy positioning)
- 25 blog articles and 3 team profiles with unverified or generic content

All are replaced with `noindex` redirect stubs that point to the nearest relevant page. They remain in the repository only so old inbound links resolve.

Because these pages previously carried unverified claims, they must not be restored from an earlier commit without re-checking every statement.

---

## 10. Review checklist for new content

Before publishing a new claim, ask:

- [ ] Can I point to the evidence for this?
- [ ] Is the stage of the work stated (completed, pilot, under development, planned)?
- [ ] If it is a number, is its basis stated on the page?
- [ ] Is a client named, and is there permission?
- [ ] Is this a Waide project or the founder's prior employment?
- [ ] Does this imply certification, accreditation or approval that is not held?
- [ ] Would this sentence still be true if read by the client it describes?
