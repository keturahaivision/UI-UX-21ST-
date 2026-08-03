# Design Language Analysis — hubtown.co.in → DMF rebuild

**Method:** the reference is a Nuxt SPA whose scroll experience is JS-driven. Live headless-browser capture was blocked by the environment proxy (`ERR_CONNECTION_RESET`), so tokens below are extracted from the **actual production stylesheet** (`design-analysis/raw/hubtown.css`, 64 KB) and font manifest — i.e. the real values, not eyeballed from screenshots. The interaction model is documented from the site markup + the pre-approved creative brief.

> Hubtown informs **patterns and proportions only**. DMF's palette is re-pitched to the brief's "dark ground → light skyline" arc using **DMF's own brand red**, not Hubtown's blue.

---

## 1. Typography

### Reference families (what Hubtown ships)
| Role | Hubtown font | Character |
|---|---|---|
| Display / headlines | **Grotesk** (Light / Regular / Bold), `.woff2` | Neo-grotesque, tight, monumental |
| Labels / counters / chapter numbers | **Commit Mono** (Regular / Bold), `.otf`/`.ttf` | Monospace, wide-tracked, technical |

### Proposed Google-Fonts equivalents (free/licensed) for the rebuild
| Role | Font | Why |
|---|---|---|
| Display | **Space Grotesk** | Same neo-grotesque voice as "Grotesk" — geometric, tight, works at 100px+ |
| Mono labels/counters | **Space Mono** | Pairs natively with Space Grotesk; matches Commit Mono's technical label feel |
| Body (long copy: project descriptions, About) | **Inter** | Neutral, legible at 15–18px; Space Grotesk is display-only |

### Type scale (extracted rem values, 16px base)
| Token | rem | px | Use |
|---|---|---|---|
| `display-mega` | 20rem | 320 | Chapter number ghost / hero flourish (fluid, capped) |
| `display-1` | 8.75rem | 140 | Chapter headline line (desktop) |
| `display-2` | 7.5rem | 120 | Chapter headline |
| `display-3` | 5rem | 80 | Sub-headline / stat number |
| `h1` | 4rem | 64 | Page titles |
| `h2` | 3rem | 48 | Section |
| `h3` | 2.5rem | 40 | — |
| `h4` | 2rem | 32 | — |
| `title` | 1.5rem | 24 | Card titles |
| `body-lg` | 1.125rem | 18 | Lead paragraph |
| `body` | 1rem | 16 | Body |
| `caption` | 0.875rem | 14 | Meta |
| `label` | 0.75rem / 0.6875rem | 12 / 11 | **Mono chapter labels, tracked-out** |

Fluid display headlines use `clamp()` + a root-font scaling trick; rebuild will use `clamp(2.5rem, 8vw, 8.75rem)` per display step.

### Letter-spacing (extracted)
- **Display headlines: negative** — `-0.02em` to `-0.04em` (tight, monumental).
- **Mono labels: positive/wide** — `0.08em` → `0.24em` (tracked-out uppercase, e.g. `LAND` / `01 — VISION`).

---

## 2. Color

### Reference palette (extracted from CSS)
| Hex | Role | Freq |
|---|---|---|
| `#020a19` | Deep navy-black — dark chapter background | 7 |
| `#052261` | Royal blue — secondary dark / gradient stop | 3 |
| `#d5e0ff` | Ice periwinkle — light text on dark, light-chapter wash | **15 (dominant accent)** |
| `#9ca3af` | Muted grey — secondary text | 1 |
| `#ffffff` / `#000` | Pure light / ink | — |

**Pattern:** dark chapters (`#020a19`) alternate with light washes (`#d5e0ff`/white); a single cool accent carries throughout; text is either near-white on dark or near-black on light. Confident, near-monochrome with one accent.

### Adapted DMF palette (the rebuild — "ground → skyline")
DMF brand red sampled from logo = **`#D81F2A`** (+ warm greys `#A09090`). The six-chapter arc darkens-to-lightens:

| Token | Hex | Chapter role |
|---|---|---|
| `ink-900` (Land) | `#0B0D0F` | Ch1 near-black earth/night |
| `ink-800` | `#14181C` | Ch2 dark |
| `slate-700` | `#2A2F36` | Ch3 transition |
| `stone-400` | `#8A8A8E` | mid greys |
| `sky-200` | `#DCE6F0` | Ch5 lightening |
| `paper-50` (Begin) | `#F6F4F1` | Ch6 bright skyline |
| `accent` | `#D81F2A` | DMF red — CTAs, counters, active filter, line-draw stroke |
| `accent-ink` | `#A31620` | red hover/pressed |

Contrast note carried to QA: any headline over hero imagery gets a scrim (`rgba(11,13,15,.55)` dark chapters / `rgba(246,244,241,.6)` light) to hold **WCAG AA** (≥4.5:1 body, ≥3:1 large display).

---

## 3. Spacing, radii, image treatment
- **Spacing scale** (extracted `--gap` vars, rem): `0.125 · 0.25 · 0.375 · 0.5 · 0.625 · 0.75 · 1 · 1.25 · 1.5 · 2 · 2.5 · 3 · 4 · 5 · 8.25 · 10`. Base grid ≈ `0.25rem`; chapter vertical rhythm uses the big steps (`8.25rem`, `10rem`).
- **Container:** full-bleed hero/chapter sections (100vw) alternating with a text column max ≈ `72rem` (1152px) inset by `--gap 2.5–5rem`.
- **Radii:** minimal — `6px` / `10px`; imagery and chapters are **sharp-edged, full-bleed**.
- **Image treatment:** full-bleed cover crops, subtle dark scrim for text legibility, occasional duotone/desaturation on transition frames. No rounded photo cards in the narrative (rounded only on dense `/projects` grid, optional).

---

## 4. Motion spec

### Signature easings (extracted, by frequency)
| Easing | cubic-bezier | Use |
|---|---|---|
| **Signature "settle"** | `cubic-bezier(0.2, 0, 0, 1)` (9×) | The hero ease — fast out, long deliberate settle. Chapter reveals, pins, counters. |
| Standard in-out | `cubic-bezier(0.4, 0, 0.2, 1)` (7×) | UI, menu, hover |
| Decelerate | `cubic-bezier(0, 0, 0.2, 1)` | Entrances |

Durations observed: micro `0.15s`; color `0.3s`; opacity fades `0.33s linear`. Narrative reveals run longer (`0.8–1.2s`) on the signature ease → the "slow, cinematic" feel.

### Interaction model (mapped to DMF's 6 chapters)
1. **Preloader** — full-screen, mono **percentage counter 0 → 100%** bound to *real* asset preloading of Chapter 1–3 imagery (Porto Island reclamation, Nadd Al Hamar plan+built, Euro University plan). No fake timers. Exit: counter hits 100 → curtain lifts on the signature ease, **zero CLS**.
2. **Chapter primitive** — full-viewport section, GSAP ScrollTrigger `pin` → scrubbed animation → release. Each chapter = a config of one `Chapter` component (label, headline, body, media, scroll behavior). Mono **one-word label** top-left (`LAND / VISION / STRUCTURE / SCALE / WORK / BEGIN`), oversized multi-line Grotesk headline, short body, one CTA.
3. **Scroll mechanics** — Lenis smooth-scroll (lerp ≈ 0.08–0.1) for the weighted glide; parallax on hero imagery; text reveal (mask-up + fade) on the signature ease.
4. **Chapter 2 — SVG line-draw** — masterplan "draws itself": `stroke-dashoffset` scrubbed by scroll over the Euro University line-plan path; resolves into the colored Nadd Al Hamar masterplan.
5. **Chapter 3 — scroll-bound cross-fade** — Nadd Al Hamar plan → built aerial of the *same* footprint; `opacity` of the built layer bound to scroll progress (a before/after with no click).
6. **Chapter 4 — stat counters** — `51 projects · 5 countries · 7 disciplines`, mono numerals ticking up on viewport entry (IntersectionObserver), signature ease, ~1.2s.
7. **Chapter 5 — horizontal gallery** — vertical scroll translates a row of flagship ProjectCards horizontally (pinned), cards link to `/projects/[slug]`.
8. **Nav / menu overlay** — persistent slim top bar with a **permanent `/projects` link** (escape hatch); full-screen overlay menu on toggle, links stagger in on the signature ease.
9. **Floating CTA** — fixed contact button (email/phone — no WhatsApp invented).
10. **Prev/Next chapter controls** — optional affordance mirroring the reference; keyboard-accessible.

### Reduced-motion path (built now, not retrofitted)
`prefers-reduced-motion: reduce` → chapters un-pin into a normal vertical stack; counters render final values immediately; Chapter 3 cross-fade becomes a static **side-by-side before/after**; Chapter 2 shows the finished colored plan (no scrub); Lenis disabled (native scroll).

---

## 5. Layout system & mobile
- Desktop: full-bleed pinned chapters; text column insets left or right, big negative space.
- Tablet/Mobile: chapters **stack vertically**, pinning relaxed to reduce jank; display type tamed via `clamp()` (e.g. `display-1` → ~3rem on 390px); horizontal gallery (Ch5) becomes a swipeable/scroll-snap row; menu overlay full-screen; touch-friendly Prev/Next.
- The theatre lives on the homepage only. `/projects` and `/projects/[slug]` are **dense, fast, conventional** layouts.

---

## 6. Voice of the design (governs every decision)
Monumental and quiet: oversized neo-grotesque headlines set tight, anchored by wide-tracked monospace labels that read like engineering annotations. Motion is slow and deliberate — long settles on a single expo-out easing, never bouncy — so each chapter lands like a held breath. Near-monochrome with one decisive accent (here, DMF red) and generous negative space; imagery is full-bleed and cinematic, darkness giving way to light as raw land becomes a built city. Technical precision presented as spectacle.
