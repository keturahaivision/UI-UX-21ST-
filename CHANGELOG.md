# CHANGELOG

## Phase 01–04 (audit → decision gate)
- Audited & archived dmfeng.com (51 projects, services, clients, assets) → `documentation/CURRENT_SITE_AUDIT.md`, `extraction/`.
- Research: reference library, competitor benchmark, DMF public-footprint verification → `documentation/`.
- Seeded provenance registry (`data/content-source-registry.json`, 60 entries).
- Content model + owner data request.
- Built 3 concept prototypes under `/concepts`; **owner chose Concept C "From Plan to Place."**

## Phase 05+ (in progress)
- Design system documented; homepage rebuilt in the chosen direction; full multi-page build underway.

## Redesign → Refined (light premium)
- Owner reviewed the dark build: too dark/heavy, not premium enough. Referenced TRC + Jacobs. Removed the "systems below" infrastructure explainer.
- Prototyped four light directions under `/redesign` (Refined, Clarity, Momentum, Legacy). **Owner chose "Refined"** — clean off-white base, editorial Fraunces headlines, red accent, imagery-led.
- Adopted Refined as the site-wide design system: `dmf` tokens (paper #FBFAF8, ink #1A1A1A, red #C4202B), light SiteNav + SiteFooter, light glass, PageHeader/StatCounter restyled.
- Rebuilt every production page in Refined: Home, About, Expertise, Projects (grid + footprint map), Project detail + Gallery, Partnerships, Insights, Careers, Contact, 404.
- Retired the dark chrome (Preloader, FloatingCTA, old Nav/Footer) from the live site; `/redesign` and `/concepts` prototypes retain their own chrome.
