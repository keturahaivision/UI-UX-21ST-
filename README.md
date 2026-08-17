# DMF Engineering — scroll-storytelling rebuild

A rebuild of [dmfeng.com](https://dmfeng.com) as a six-chapter scroll narrative — *the transformation of empty land into a living city* — told entirely with DMF's own extracted project material. Built in a Hubtown-inspired design language (patterns only; no reference assets copied).

**Stack:** Next.js 14 (App Router) · Tailwind CSS · GSAP ScrollTrigger · Lenis smooth scroll.

## Quick start
```bash
npm install
cp .env.example .env.local     # set form endpoint + contact email
npm run dev                    # http://localhost:3000
```

## Build & deploy
```bash
npm run build                  # static-optimised; 51 project pages pre-rendered (SSG)
npm run start                  # serve the production build
```
Deploy to any Node host or Vercel. All content is baked at build time from `src/data/content.json`.

## Regenerating content & images
The site reads from `src/data/content.json`, generated from the extraction:
```bash
npm run data      # extraction/content/* -> src/data/content.json
npm run images    # extraction/assets/files/* -> public/images/*.webp (needs the source files)
```
`extraction/assets/files/` (raw downloads) is git-ignored; re-fetch from `extraction/assets/manifest.json` if a fresh clone needs them.

## Architecture
```
src/
  app/                 routes: / (chapters), /projects, /projects/[slug], /services, /about, /contact
                       + sitemap.js, robots.js, fonts, icons, globals.css
  components/
    motion/            SmoothScroll (Lenis+GSAP, route cleanup), Reveal
    chapters/          Chapter primitive (pin+scrub API), Ch1-6, SurveyLines
    ui/                Preloader, Nav, Footer, FloatingCTA, ProjectCard, ProjectGrid,
                       Gallery (lightbox), StatCounter, ContactForm, PageHeader
  lib/                 gsap, useReducedMotion, seo (metadata + JSON-LD)
  data/content.json    single source of truth (51 projects, services, stats, clients)
tailwind.config.js     token layer (colors, type scale, easings) from design-analysis/
```

### Motion engine
- **`Chapter`** is the one narrative primitive: every homepage chapter is a config of it (pin -> scrub-progress -> release).
- **Preloader** counts real asset-load progress for the Chapter 1-3 imagery (no fake timers).
- **`prefers-reduced-motion`** is a first-class path: pins release into a vertical stack, counters render final values, the cross-fade becomes a side-by-side.

## Design & provenance docs
- `design-analysis/design-language.md` — tokens + motion spec (extracted from the reference CSS)
- `plan/storyboard.md` — the six chapters + image decisions
- `plan/copy-for-approval.md` — every newly-written line, for sign-off
- `extraction/` — full source extraction, gaps, stats, chapter pairs
- `qa/` — self-review iteration log + verification report

## Notes
- Redirects: `/sh_projects/{slug}` -> `/projects/{slug}`, `/our-clients` -> `/about` (`next.config.mjs`).
- SEO: per-page metadata, Organization + per-project JSON-LD, sitemap, robots.
- Only DMF's own content/imagery is used; the reference site informed interaction patterns only.
