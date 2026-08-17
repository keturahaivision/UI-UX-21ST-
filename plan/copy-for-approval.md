# Copy for Approval — every newly-written line

The source site had **no meta descriptions** and sparse body copy. Per your Checkpoint-1 approval, new SEO/connective copy was auto-generated **from extracted facts only** — no invented clients, stats, awards or claims. Everything below is new writing awaiting your sign-off. DMF's own extracted copy (About narrative, service descriptions, project descriptions, ethos quote) is used verbatim and is **not** listed here.

## Homepage chapter copy `[NEW COPY]`
| Chapter | Line |
|---|---|
| 1 · Land | **"Every city begins as a question."** (brief-specified headline) |
| 1 · Land | "Before the skyline, there is only ground — and the discipline to imagine what it could hold." |
| 1 · Land | "Scroll to build" |
| 2 · Vision | "A plan is a promise to the ground." (headline over real About paragraph) |
| 3 · Structure | "The same ground, now a neighbourhood." |
| 3 · Structure | "What began as survey lines becomes streets, homes and infrastructure — Nadd Al Hamar, delivered." |
| 4 · Scale | "Three decades of work, measured." |
| 5 · Work | "The portfolio that answers." + "A cross-section of 51 projects across master planning, infrastructure and architecture." |
| 6 · Begin | "Innovation, expertise, and dedication converge to redefine excellence." (condensed from DMF's own footer ethos quote) |

> Note: the **"three decades"** phrasing in Chapter 4 is the one soft claim not directly in the extracted data (project dates range 2007–2016+). If you can't substantiate ~30 years, I'll change it to a neutral line ("The work, measured."). **Flag for your call.**

## SEO titles & descriptions `[NEW COPY]` (all auto-generated from facts)
| Page | Description |
|---|---|
| Home | "From empty land to a living city — DMF Engineering delivers master planning, roads & infrastructure, architecture and structural design across the UAE and Gulf." |
| /projects | "Explore 51 DMF Engineering projects across master planning, roads & infrastructure, architecture and structural design in the UAE, Saudi Arabia, Bahrain, Qatar and beyond." |
| /services | "Master planning, roads & infrastructure, architecture, structural, civil, landscape, traffic, construction supervision, cost and project management — DMF's full multidisciplinary offer." |
| /about | "DMF Engineering, founded by David Ghosheh, delivers innovative and sustainable engineering across the UAE, Gulf and worldwide — built on expertise, integrity and close client collaboration." |
| /contact | "Get in touch with DMF Engineering — Baniyas Road, Green Tower, Deira, Dubai, UAE. Call +971 4 227 2525 or send us a message." |
| /projects/[slug] | Per-project: `"{disciplines} by DMF Engineering in {location} for {client}."` — assembled only from that project's extracted facts. |

## Interior connective copy `[NEW COPY]`
- /projects intro: "51 projects across 5 countries — filter by discipline or location."
- /about Mission/Vision/Values: condensed from the extracted About page (DMF's own words, lightly tightened).
- /contact heading: "Let's build something lasting."
- 404: "This ground is undeveloped."

## Placeholder / decision items still open
- **Contact email** — currently `info@dmfeng.com` (placeholder via `NEXT_PUBLIC_CONTACT_EMAIL`). Confirm the real address.
- **Form endpoint** — `NEXT_PUBLIC_FORM_ENDPOINT` unset; wire a Formspree (or equivalent) URL in `.env`.
- **Instagram** — dropped (was a dead `#` link); re-add if you have a real handle.
