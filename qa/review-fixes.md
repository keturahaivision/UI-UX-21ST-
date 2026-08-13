# Adversarial Review — findings & fixes

A 5-dimension workflow review (design/glass, accessibility, correctness, responsive, provenance)
surfaced 22 findings; each was independently verified before fixing. All 22 addressed:

## High
1. Duplicate chapter eyebrow overlapping H2 → removed the absolute Chapter label on Strata/Connection (in-content eyebrow kept).
2. Accent red #D81F2A fails AA on dark (3.85:1) → small label text switched to accent-soft #E85761 (5.53:1); brand red kept for fills/strokes/large display.
3. Euro University Bahrain (CONFLICTING) featured everywhere → excluded in build-data; removed from flagships + projects; stats recomputed (51→50 projects, 5→4 countries, Bahrain dropped, discipline counts adjusted). Preloader + copy updated.
4. Gallery lightbox no focus management → focus moved in on open, trapped, restored on close; dialog aria-label added.
5. Strata overflows viewport on mobile/tablet → pins gated to ≥lg; sections grow (py-24) when relaxed; caption hidden below lg; items-start on mobile.

## Medium
6. Low contrast over bright photo in The Connection → added base scrim (ink-900/55) + raised label opacities.
7. Mobile nav links focusable when closed → `invisible` when closed.
8. Unscrolled nav scrim insufficient → stronger top gradient (ink-900/80).
9. Stale sitemap → rebuilt to the live IA (expertise/partnerships/insights/careers, no /services).
10. Pins never relaxed on mobile → Chapter now gates pinning on ≥1024px.
11. Glass overused on opaque panels → reserved glass for nav/overlays/signature panels; info panels use bordered cards.
12. Hero eyebrow duplicated the logo → replaced "DMF ENGINEERING" with "ENGINEERING CONSULTANT".
13. Contact status not announced → wrapped in role="status" aria-live="polite".
14. Mobile menu didn't lock scroll → body overflow locked while open.
15. Invented email info@dmfeng.com published → email now env-gated (null default); omitted from JSON-LD/UI until confirmed; CTAs fall back to the contact page.

## Low
16. Hard-coded 10px in Strata → token (text-label-sm).
17. Active nav lacked aria-current → added.
18. ProjectGrid ignored ?c → now honors country deep-link.
19. Unused glass utilities → glass-hairline & glass-light removed.
20. No skip link → skip-to-content added in layout.
21. Projects heading skip (h1→h3) → grid section heading is now an h2.
22. Dead /services page → removed (redirect handles it).
