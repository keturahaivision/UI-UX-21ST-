# Phase 01 — Current Site Audit: dmfeng.com

**Captured:** 2026-08 · **Method:** WP REST API + targeted HTML crawl (the projects CPT is not REST-exposed). Full raw + normalized capture archived under `extraction/` (the project's `/legacy` equivalent); binary assets are re-fetchable from `extraction/assets/manifest.json`.

> This audit treats the existing WordPress site strictly as **a dataset and legacy system** — a source of verifiable company facts and project names — never as a design constraint.

## 1. Platform & structure
- **CMS:** WordPress (block theme) + legacy WPBakery shortcodes in page bodies; a non-REST custom post type `sh_projects` holds the portfolio.
- **Primary nav:** Home / Projects / Services / About Us / Contact Us.
- **Footer:** ethos quote — *"At DMF, innovation, expertise, and dedication converge to redefine excellence in architectural and engineering solutions."*; LinkedIn (real); Instagram (dead `#` placeholder); `© DMF Engineering`.
- **URL structure:** projects live at `/sh_projects/{slug}/` with paginated archive `/projects/page/N/` (8 pages).

## 2. Content inventory (extracted)
| Type | Count | Notes |
|---|---:|---|
| **Projects** | **51** | Full records: name, scope, description, client, location, size, completion, gallery. |
| Services | 10 | Master Planning, Roads & Infrastructure, Architecture, Structural, Civil, Landscape, Traffic, Construction Supervision, Cost Mgmt, Project Mgmt. |
| Client logos | 15 | On the "Our Clients" page (alt text empty). |
| Named clients (in project records) | 39 | e.g. Wasl, Dubai Properties, Damac, Baniyas Investment Co., Ajman Municipality. |
| Media assets | 484 referenced / 749 on site | 374 optimized to WebP for reuse. |
| Gallery images | 412 | avg 8.1/project; all visually classified. |

**Project data completeness (of 51):** client 50 · location 45 · description 46 · size 47 · completion date ~40. Gaps logged in `extraction/gaps.md`.

## 3. Geographic & discipline footprint (computed, no rounding)
- **Countries:** UAE 36 · Saudi Arabia 5 · Afghanistan 2 · Qatar 1 · Bahrain 1 (6 projects unlocated).
- **Disciplines:** Roads & Infrastructure 45 · Master Plan 24 · Supervision 15 · Traffic 11 · Architectural 8 · Structural 7 · Landscape 4.

## 4. Contact (REQUIRES_CONFIRMATION before publication)
- Address: Baniyas Road, Green Tower, 5th floor, Office 504, Deira, Dubai, UAE.
- Phone: +971 4-227-2525. Email: none published on source. LinkedIn: linkedin.com/company/dmfdubai/.

## 5. SEO / technical state
- **Meta descriptions: empty site-wide**; no OG/Twitter cards; no structured data (no JSON-LD). Excerpt fields contain raw WPBakery shortcodes.
- No sitemap surfaced from content; mixed http/https image references (normalized in our manifest).
- No analytics, no project map, no filtering UI on the archive (categories exist only as CSS classes on cards).

## 6. Functional behaviours observed
- Home hero image slider (8 unique flagship backgrounds); "Recent Projects" grid; simple `Loading…` preloader.
- Project detail: hero, PROJECT DETAILS block, static gallery grid, Prev/Next.
- Contact: jQuery AJAX form (Name/Email/Subject/Message) posting to a WP handler (not reusable).

## 7. What the legacy site lacks (opportunity for the rebuild)
- No positioning or narrative — reads as a generic WordPress portfolio.
- No infrastructure story; disciplines presented as a flat list.
- No interactive project map; no partnerships; no insights; no careers.
- No provenance discipline; no SEO; no motion craft; no accessibility considerations.

## 8. Reusable assets carried forward
- 51 normalized project records + 10 services + 15 clients (`extraction/content/`, `src/data/content.json`).
- 374 optimized WebP images + classification + chapter-pair analysis.
- A working Next.js 14 + GSAP/Lenis motion engine (reusable `Chapter` pin/scrub primitive) and token layer.

**Deliverable status:** ✅ Audit complete. Legacy content archived under `extraction/`. Proceeding to provenance registry + content model.
