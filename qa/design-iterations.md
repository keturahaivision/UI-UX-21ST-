# Self-Review Iteration Log (Phase 4)

Screenshots captured with headless Chromium against the running server at 1440 and 390 widths, seven scroll positions across the homepage plus each interior page. Frames in `qa/shots-iter{1,2,3}/`.

## Iteration 1 — first render
**Observed**
- At 12% scroll the page was already at Chapter 3 → the six chapters were **not pinning**; they scrolled past as a plain stack (document height 6047px ≈ 6 viewports).
- Chapter 1 "Land" showed Porto Island's **built resort**, not raw terrain — wrong for the "empty land" opening.
- Chapters otherwise rendered with correct type scale, labels and palette.

**Diagnosis**
- Motion bug: `SmoothScroll` (the parent) ran `ScrollTrigger.getAll().kill()` in its mount effect. Because child effects run before parent effects in React, the parent wiped every chapter's freshly-created pin on mount.

**Fixed**
- `SmoothScroll` no longer kills triggers on mount; it skips the first pathname run and only resets scroll + `ScrollTrigger.refresh()` on real route changes (chapter unmount already cleans its own `gsap.context`). Added staged `refresh()` calls after Lenis init to re-measure once preloader/imagery settles.

## Iteration 2 — pinning verified, land image wrong
**Observed**
- Document height jumped to **12635px** with **4 active pins** (Land, Vision, Structure, Work) — pinning + scrub now working; survey lines draw over the terrain and the NAH plan→built cross-fade tracks scroll.
- The replacement "Land" image (`Warsan3_002`) turned out to be a **detailed master plan with a legend**, not raw ground — still wrong for Chapter 1.
- Project cards: multi-discipline label wrapped to two lines and collided with the title.

**Fixed**
- Sourced a genuine raw-terrain frame: cropped the inner photo band out of the Porto Island reclamation composite (`ch1-land.webp`) — sand, tyre tracks, sea, machinery. Wired into Chapter 1 + preloader.
- `ProjectCard` label switched to the single primary discipline with `truncate`.

## Iteration 3 — polish pass
**Observed**
- Chapter 1 now opens on real reclaimed land, near-black with the red survey grid resolving — on-brief.
- Card labels sit on one line; projects grid, filters (discipline + country with counts), services, about (values + client wall), contact all read cleanly at 1440 and 390.
- Mobile: display headline scales via `clamp()`, menu collapses to a MENU toggle, chapters stack.

**Remaining nits (tracked, non-blocking)**
- A handful of project **thumbnails are source composites** (photo inset on a white page) — cosmetic; would need per-image cropping. Logged in `qa/verification-report.md`.
- Dev-only React hydration warning ("Extra attributes from the server: style") from the preloader toggling `documentElement` overflow — no production impact.
- One source image (`RasAlKhor…Sanctuary`) is corrupt at origin → excluded (1 of 375).
