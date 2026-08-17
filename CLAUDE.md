# CLAUDE.md — DMF Engineering website (project brain)

Every session inherits this. Read before editing.

## Positioning
**DMF — Engineering the roots of development.** DMF works at the level beneath successful development: master planning, roads & infrastructure, traffic & mobility, civil, structural, architecture, landscape, project & cost management, construction supervision. Narrative spine: **THE CITY ABOVE → THE SYSTEMS BELOW → THE CONNECTION** (where DMF lives).

Standard to test every decision against: *"These are the people who understand what has to happen beneath the development for the development to work."*

## Chosen creative direction (Phase 04 gate — owner picked)
**Concept C — "From Plan to Place."** Editorial, sequential. Master-plan drawings dissolve into built photography; every project is a challenge → approach → outcome story. The mandated §8 signature "Beneath the City" layered-strata moment is kept as one section within this editorial frame.

## Voice
Engineer's precision, planner's patience, Dubai's ambition. Short declarative sentences. Verbs over adjectives. Numbers only when verified. **Banned words:** synergy, world-class, cutting-edge, state-of-the-art, leveraging, holistic, best-in-class — and any sentence that could sit unchanged on a competitor's site.

## Truth & provenance (overrides aesthetics)
- Never invent facts (values, areas, clients, dates, roles, approvals, awards, counts, status).
- Every published fact has an entry in `data/content-source-registry.json`. Nothing `UNVERIFIED`/`CONFLICTING` publishes without owner approval.
- **CONFLICTING — do not feature:** Euro University Bahrain (public records credit Gulf House Engineering; needs owner clarification).
- **REQUIRES_CONFIRMATION before publish:** office address, phone, email, founder title, founding year, headcount, licences, certifications, awards, memberships, client names for emphasis.
- Decorative CAD/engineering graphics are labeled **conceptual** — never passed as official drawings.

## Design tokens (see tailwind.config.js + documentation/DMF_DESIGN_SYSTEM.md)
- Type: **Space Grotesk** (display) · **Space Mono** (technical labels/coordinates) · **Inter** (body). Two-plus-mono max.
- Color: near-black graphite `ink-900 #0B0D0F` · warm off-white `paper-50 #F6F4F1` · one accent **DMF red `#D81F2A`**. Restraint.
- Motion: signature easing `cubic-bezier(0.2,0,0,1)`; things draw / plot / reveal in layers. `prefers-reduced-motion` respected everywhere. GSAP + ScrollTrigger + Lenis.

## Architecture
Next.js 14 App Router · Tailwind · GSAP/ScrollTrigger · Lenis · (Mapbox GL for the project map — pending token). Content in `src/data/content.json` + `content/`, never hardcoded. Reusable `Chapter` pin/scrub primitive; `asset()` resolver for portable image hosting.

## Sitemap (target)
Home · About · Expertise · Projects (+ filters + map) · Insights · Partnerships · Careers · Contact.

## Data on hand
51 verified projects, 10 services/disciplines, 15 client logos, 374 optimized WebP (`public/images/`), full extraction in `extraction/`, research in `documentation/`.
