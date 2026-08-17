# Phase 5 — Verification Report

Run against the production build (`next build` + `next start`), self-review screenshots in `qa/shots-iter3/`.

## 1. Content parity — PASS
`npm run data && node scripts/parity-check.mjs`:
- Extracted projects **51** → Built projects **51** · **0 missing, 0 extra** — zero silent losses.
- Every project has a hero image and a non-empty gallery (0 without).
- Services **10**, client logos **15**, flagships **8** all present.
- Pages present: Home, /projects, /services, /about, /contact + 51 `/projects/[slug]` (63 routes total in the build manifest).

## 2. Motion QA — PASS (with notes)
- Pinning verified: document height **12,635px** with **4 active ScrollTriggers pinned** (Land, Vision, Structure, Work). Fixed the mount-time trigger-kill bug (see `design-iterations.md`).
- Scrub bindings confirmed: Chapter 2 survey-line `stroke-dashoffset` and Chapter 3 plan→built `opacity` both track scroll progress in captured frames.
- Route cleanup: leaving a page unmounts its chapters; each chapter reverts its own `gsap.context`; `SmoothScroll` re-measures on route change. No cross-page pin leakage.
- **Reduced motion:** `useReducedMotion` disables Lenis and all pins; `Chapter` renders static (`onProgress(1)`), `StatCounter` sets final value immediately, Chapter 5 track stacks vertically. Path is built in, not retrofitted.
- Keyboard: native scroll works (Lenis is wheel/touch smoothing only, not a scced hijack); Tab reaches nav, filters, gallery, form; gallery lightbox supports Esc / ← / →.

## 3. Accessibility — PASS AA (with overlay treatment specified)
- **Contrast / text over imagery:** every hero/chapter with text over a photo applies a scrim (`u-scrim-dark` = `rgba(11,13,15,.2→.65)`, plus a flat `bg-ink-900/50` on Chapter 1) so `paper-50` (#F6F4F1) body text clears **≥4.5:1** and large display **≥3:1**. Light Chapter 6 uses `ink-900` on `paper-50` (contrast ~17:1).
- Accent red `#D81F2A` on `ink-900` ≈ 4.6:1 (labels are large/mono — AA large).
- Heading order: one `<h1>` per page; chapters use `<h2>`; cards `<h3>`. Chapter content is in DOM order for screen readers (motion is transform/opacity only, not DOM reordering).
- Focus: global `:focus-visible` 2px accent outline; interactive elements are real `<button>`/`<a>`.
- Forms: every field has an associated `<label>`; required flagged; status messages are text, not colour-only.
- Images carry alt text (project name-derived where source alt was empty).

## 4. Performance — PASS (with notes)
- Home First Load JS **158 kB** (includes GSAP + Lenis); interior pages **87–110 kB**. Shared chunk 87 kB.
- Fonts self-hosted (`next/font/local`, `display: swap`), latin subset — no external font requests, no layout shift from font swap.
- Images pre-converted to **WebP** (374 files, capped at 1920px, q78); below-fold images `loading="lazy"`.
- **Preloader & CLS:** the preloader is a fixed full-screen overlay that fades out — it does not reflow content on exit (no CLS). Critical Chapter 1–3 imagery is preloaded before reveal.
- *Not run:* a live Lighthouse pass (no headless Lighthouse in this environment). Bundle sizes and the above are the proxy; recommend a Lighthouse run on deploy.

## 5. Open items (carried to you)
- `[NEW COPY]` — all new lines listed in `plan/copy-for-approval.md` await sign-off; the Chapter 4 **"three decades"** phrasing is the one soft claim flagged for confirm/remove.
- **Contact email** placeholder (`info@dmfeng.com`) — confirm real address.
- **Form endpoint** — set `NEXT_PUBLIC_FORM_ENDPOINT` (Formspree-style) in `.env`.
- **Instagram** — dropped (dead `#` on source); re-add with a real handle if wanted.
- **Composite thumbnails** — a few project images are source composites (photo inset on white); cosmetic, listed for optional per-image cropping.
- **Chapter 2→3 imagery** — Nadd Al Hamar pair used (same-site, verified). Chapter 1 land is Porto Island reclamation (different project — disclosed, as no single project has raw-land + plan + built at one framing).
- 1 corrupt source image (`RasAlKhor…Sanctuary`) excluded of 375 referenced.
