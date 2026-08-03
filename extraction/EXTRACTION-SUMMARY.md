# CHECKPOINT 1 — Phase 1 Extraction Summary

**Source:** https://dmfeng.com/ · **Extracted:** 2026-08-03 · **Method:** WP REST API + HTML-crawl fallback

## Summary table

| Item | Count | Method | Notes |
|---|---:|---|---|
| **Projects** | **51** | HTML crawl (8 pages × 7) | `sh_projects` CPT **not** REST-exposed |
| Pages | 8 | REST API | 6 real + 2 junk (`hello`, `sample-page`) |
| Services | 10 | REST API (posts) + `/services/` | Master Planning, Architecture, Roads & Infra, Structural, Civil, Landscape, Traffic, Construction Supervision, Cost Mgmt, Project Mgmt |
| Client logos | 15 | HTML crawl | Empty alt text (gap) |
| Media on site | 749 | REST count | — |
| **Assets downloaded** | **484** | Direct download | 150 MB, **0 broken**, 482 with dimensions |
| Project gallery images | 412 | Parsed from detail pages | avg 8.1/project (range 2–17) |

## Coverage — API vs scrape
- **REST API covered:** all pages, all 10 service posts, media counts, taxonomies, nav labels.
- **HTML crawl required for:** the 51 projects (CPT hidden from REST), nav/footer/contact/client markup.
- **0 broken assets**; every referenced image downloaded and measured.

## What was captured (in `extraction/`)
- `content/projects-all.json` + `content/projects/*.json` — 51 projects: name, scope tagline, description, details (service/client/size/location/completion), category slugs + display, gallery (url+alt), thumbnail, source→target URL.
- `content/services.json` — 10 disciplines with descriptions.
- `content/clients.json` — 15 client logos (names filename-derived).
- `content/page-*.json` — Home, About, Contact, Projects, Services normalized.
- `site-structure.json` — nav, footer (ethos quote, LinkedIn, ©2025), contact block, category taxonomy, project counts by discipline & country.
- `assets/manifest.json` — 484 assets (url, file, bytes, width, height, usage contexts).
- `functionality.md`, `gaps.md`.

## Project category taxonomy (for the filter UI)
Roads & Infrastructure **34** · Master Plan **21** · Supervision **7** · Architectural **5** · Traffic **4** · Landscape **3** (+ long-tail sub-disciplines).

## Projects by country (for stat counters — option A)
UAE **36** · Saudi Arabia **5** · Afghanistan **2** · Qatar **1** · Bahrain **1** · (6 unlocated).

## Gaps flagged (full list in `gaps.md`)
1. **All meta descriptions empty** site-wide → new SEO copy needed `[NEW COPY — needs approval]`.
2. 5 projects have no description, 6 no location, 1 no client.
3. Empty alt text on gallery images + all client logos.
4. Instagram link is a dead `#`; no contact email; contact form endpoint not reusable; no map embed.

## ⛔ Consolidated questions before Phase 2/3
1. **SEO copy** — approve auto-generating page & project meta/OG descriptions from extracted facts?
2. **Stat counters** — by **discipline** (Roads 34 / Master Plan 21 / …) or by **country** (UAE 36 / KSA 5 / …)? (Both computed; pick one or both.)
3. **Instagram** — provide a real URL or drop the icon?
4. **Contact** — supply an email address; pick a form endpoint (Formspree / Resend / serverless)?
5. **`architectural-designs`** thin entry — keep, rewrite, or de-list?

---
*Phase 1 complete. Awaiting approval to proceed to Phase 2 (Hubtown design-language analysis).*

---

# CHECKPOINT 1 — v2 ADDENDUM (image classification, chapter pairs, stats)

Per master-prompt v2 (pre-approved 6-chapter "empty land → living city" narrative), Phase 1 gained three deliverables. **All 412 gallery images were visually reviewed** via 12 labeled contact sheets in `design-analysis/montages/`.

## Image classification → `extraction/assets/classification.json`
Filename-verified, high-precision tags (visual review confirms more plan-type renders exist among the 293 "render" bucket):
- masterplan-drawing **27** · hero **32** · aerial-terrain **2** · detail **7** · render **293**
- 51 leaked DMF-logo refs (`1.png`) stripped from galleries.

## Chapter 2→3 plan↔built pairs → `extraction/chapter-pairs.json` (all same-site)
| Rank | Project | Plan | Built | Notes |
|---|---|---|---|---|
| **1** | **Nadd Al Hamar** | `Wb_NAH-Masterplan.jpg` | `Wb_NAH-01.jpg` | **Brief-preferred; cleanest registration** (same triangular footprint on E311) |
| 2 | Euro University Bahrain | `Wb_EURO-N-MP.jpg` | `Wb_EURO-N-12.jpg` | Best for SVG line-draw; flagship |
| 3 | Al Salamah | `Wb_SALAMAH-MP.jpg` | `Wb_SALAMAH-1.jpg` | Flagship |
| 4 | Jebel Ali Development | `JAD_MasterplanN2.jpg` | `06092020_jad61.jpg` | Flagship |
| 5 | Bawabat Al Sharq | *(none — flag)* | villa renders | Brief-preferred BUT no true plan drawing in gallery |

## Chapter 1 "Land" candidates
Porto Island reclamation aerials (stored under `hillside-library`), Heart of Jeddah empty-plot aerial, Al Qusais raw desert site.

## Derived stats → `extraction/stats.json`
Projects **51** · Countries **5** (UAE 36 / KSA 5 / Afghanistan 2 / Qatar 1 / Bahrain 1) · Disciplines **7** (Roads 45 / Master Plan 24 / Supervision 15 / Traffic 11 / Architectural 8 / Structural 7 / Landscape 4) · Gallery images **412**.

## Flags for the narrative
- **Bawabat** (a brief preference) has no clean masterplan drawing → **recommend Nadd Al Hamar as Chapter 2→3 primary**.
- No single project has raw-terrain + plan + built at identical framing, so **Chapter 1 (Land) uses a different project** than Chapters 2–3 (which stay same-site). Disclosed, not silently mismatched.
