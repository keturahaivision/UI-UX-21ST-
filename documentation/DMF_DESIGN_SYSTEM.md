# Phase 05 — DMF Design System

Token source of truth: `tailwind.config.js`. Extended rationale: `design-analysis/design-language.md`. No hard-coded values in components.

## Type
| Role | Family | Use |
|---|---|---|
| Display | **Space Grotesk** (400/500/700) | Headlines, set tight (`-0.02/-0.04em`), up to 140px |
| Technical | **Space Mono** (400/700) | Labels, coordinates, chainage, depth markers, counters — tracked wide (`+0.16em`) |
| Body | **Inter** (400/500/600) | Long copy, project descriptions |

Scale (rem): display-1 `clamp(3rem,9vw,8.75rem)` · display-2 · display-3 · h1–h4 · title · body-lg `1.125` · body `1` · caption `.875` · label `.75` · label-sm `.6875`.

## Color (restraint — one accent)
| Token | Hex | Role |
|---|---|---|
| `ink-900` | `#0B0D0F` | Base graphite |
| `ink-800 / slate-700` | `#14181C / #2A2F36` | Panels, borders |
| `stone-400` | `#8A8A8E` | Secondary text |
| `paper-50` | `#F6F4F1` | Warm off-white ground/inverse |
| `accent` | `#D81F2A` | DMF red — CTAs, active state, line-draw stroke, counters. Used scarcely. |
| `accent-ink` | `#A31620` | Red pressed |

Text over imagery always gets a scrim (`u-scrim-dark` / `u-scrim-light`) to hold WCAG AA.

## Spacing / radii
Base grid `0.25rem`; chapter rhythm uses `8.25rem`/`10rem`. Radii minimal: `6px`/`10px`. Full-bleed, sharp-edged imagery.

## Motion grammar
- **Signature easing** `cubic-bezier(0.2,0,0,1)` (expo-out, long settle). Standard UI `cubic-bezier(0.4,0,0.2,1)`.
- Durations: micro `.15s`, color `.3s`, narrative reveals `.8–1.2s`.
- Vocabulary: things **draw** (SVG stroke-dashoffset), **plot** (nodes/lines), **reveal in layers** (masked strata), **dissolve** (scroll-bound cross-fade), count-ups on verified numbers only.
- `prefers-reduced-motion`: pins release to a static stack, counters show finals, dissolve becomes side-by-side. First-class, not retrofitted.

## Signature interactions
- **The dissolve** (Concept C): master-plan → built photo of the *same* site, opacity bound to scroll.
- **Beneath the City**: strata (MASTER PLAN → ROADS → TRAFFIC → DRAINAGE → WATER → POWER → LANDSCAPE → STRUCTURES) assemble on scroll with depth coordinates. Labeled conceptual.

## Component library
`Chapter` (pin/scrub primitive) · Nav + menu overlay · Preloader (real asset %) · Reveal · Strata · PlanToPlace (dissolve) · StatCounter · ProjectCard / ProjectGrid (discipline + country filters) · CaseStudy sections · Gallery (lightbox) · ContactForm · FloatingCTA · Footer · (ProjectMap — Mapbox, pending token).

## Responsive classes
320–767 / 768–1023 / 1024–1439 / 1440+ — mobile gets its own interaction logic (pins relaxed, type tamed via `clamp()`, touch controls), not a shrunk desktop.
