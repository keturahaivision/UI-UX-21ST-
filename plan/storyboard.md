# Homepage Storyboard — locked decisions

Pre-approved 6-chapter narrative: **empty land → living city**, dark→light, DMF content only.

| # | Chapter | Label | Media (DMF, extracted) | Scroll behavior |
|---|---|---|---|---|
| 1 | **Land** | `LAND` | **Porto Island reclamation aerial** (raw land from water) | slow reveal + survey grid lines fade in |
| 2 | **Vision** | `VISION` | **Euro University line-plan** draws itself → resolves to **Nadd Al Hamar colored masterplan** | SVG `stroke-dashoffset` scrubbed by scroll |
| 3 | **Structure** | `STRUCTURE` | **Nadd Al Hamar masterplan → built aerial** (same footprint) | scroll-bound opacity cross-fade (before/after, no click) |
| 4 | **Scale** | `SCALE` | Stat counters from `stats.json`: **51 projects · 5 countries · 7 disciplines** | count-up on viewport entry |
| 5 | **Work** | `WORK` | Flagship ProjectCards (Nadd Al Hamar, Al Salamah, Euro University, Jebel Ali, Bawabat, Porto Island…) | vertical scroll → horizontal pinned gallery |
| 6 | **Begin** | `BEGIN` | DMF ethos quote + contact CTA | brightens, gentle settle, anchor to top |

### Locked image decisions (user-approved at Checkpoint 1)
- **Chapter 1 land** = Porto Island reclamation (`hillside-library` record, `Wb_porto-island-Aerial-02.jpg`).
- **Chapter 2 SVG line-draw** = Euro University (`Wb_EURO-N-MP.jpg`) — cleanest line plan.
- **Chapter 2→3 cross-fade** = Nadd Al Hamar (`Wb_NAH-Masterplan.jpg` → `Wb_NAH-01.jpg`) — verified same-footprint registration.
- Bawabat Al Sharq → demoted to Chapter 5 gallery feature (no clean masterplan drawing).

### Other locked decisions
- Stat counters: **by discipline** (+ countries shown in Ch4 grid). SEO: **auto-generate from facts**, tagged `[NEW COPY]`. Contact: **Formspree-style endpoint via `.env`** + placeholder email. Projects: **keep all 51**. Instagram: **drop dead `#` link**, keep LinkedIn.
