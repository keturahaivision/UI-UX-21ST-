# DECISIONS.md

Consequential design/architecture/content decisions and their reasoning.

| Date | Decision | Reasoning |
|---|---|---|
| 2026-08 | **Creative direction: Concept C "From Plan to Place"** (owner pick at Phase 04 gate) | Editorial, content-driven; plays to DMF's real masterplan→built material and case-study depth. Blends the mandated §8 "Beneath the City" strata as one section. |
| 2026-08 | Positioning: "Engineering the roots of development" | Research (Agents B/C): no GCC competitor owns infrastructure + design craft; the "systems beneath" is the ownable, defensible space. |
| 2026-08 | Reuse prior extraction + Next.js/GSAP motion engine | 51 verified projects, 374 optimized images, and a working pin/scrub `Chapter` primitive already exist — no reason to re-crawl or rebuild the engine. |
| 2026-08 | Fonts: Space Grotesk + Space Mono + Inter (self-host/Google) | Neo-grotesque display + technical mono matches the "draws for a living" aura; Inter for readable long copy. |
| 2026-08 | Accent: DMF red #D81F2A (sampled from logo), single accent | On-brand, restraint per §8; avoids generic corporate blue. |
| 2026-08 | Euro University Bahrain → CONFLICTING, pulled from features | Public records credit Gulf House Engineering; must be owner-clarified (Agent A). |
| 2026-08 | Image hosting via `asset()` + GitHub raw for previews | Keeps deploys binary-free; 77MB of WebP served from the public repo. |
| 2026-08 | Vercel deploy via bootstrap tarball-fetch | Image-heavy site; inlining 77MB is impractical, so a 1-file bootstrap fetches the repo at build. |
