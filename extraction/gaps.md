# DMF Content Gaps & Data-Quality Log

Every gap the rebuild must resolve. Anything filled with new writing is tagged **`[NEW COPY — needs approval]`** and repeated in `qa/verification-report.md` open items. **No DMF facts are invented.**

## 1. SEO / meta (site-wide) — EMPTY on source
All pages ship **no meaningful meta description** and no Yoast/OG data (excerpt fields contain raw WPBakery shortcodes). Every page below needs new SEO copy at rebuild:
- Home, Projects, Services, About, Contact, Our Clients — `meta_description` **`[NEW COPY — needs approval]`**
- Per-project `<title>`/description — generate from name + scope + location **`[NEW COPY — needs approval]`**
- Open Graph / Twitter cards — none exist; author at rebuild.

## 2. Projects — missing fields
- **No description** (5): `al-mayar-2`, `grand-hyatt`, `hotel-staff-accommodation`, `mirdif-central-park`, `mixed-use-development-alrowaiyah-third` → detail page needs a short factual line built only from known fields (service/client/location), marked `[MISSING — see gaps.md]` where nothing exists.
- **No Location** (6): `ajman-industrial-area-roads`, `al-ahli-club-master-plan`, `al-hamra-avenue`, `al-hamra-village`, `architectural-designs`, `bawabat-al-sharq-phase-5` → omit the field; do **not** guess a country.
- **No Client** (1): `architectural-designs`.
- **Sparse gallery**: `mirdif-central-park` has only 2 images (all others ≥3).
- `architectural-designs` is a thin catch-all entry (few facts) — candidate to keep as-is or de-list; **decision needed**.

## 3. Images — quality/accessibility
- **Alt text**: project gallery images and all 15 client logos have **empty/near-empty alt attributes**. Rebuild must author alt text (derive from project name + client name) — factual, not decorative claims.
- **Mixed content**: hero image `Al-Ahli-91_Home_BG.jpg` referenced over `http://` — normalized to `https://` in `assets/manifest.json`.
- **Filenames** are the only "metadata" for client logos → client display names are **best-guess from filename** and need confirmation (`extraction/content/clients.json`).

## 4. Functional placeholders
- **Instagram** footer/social link is `#` on source (dead) → **decision: real URL or remove?**
- **Contact form endpoint**: source posts to a WordPress AJAX handler we can't reuse. Rebuild needs a new endpoint (form service / serverless). **Decision needed** — see `.env.example` at rebuild.
- **Email address**: contact page shows phone + address but **no email** → need one for the floating CTA and form, or use a form-only contact. **Decision needed.**
- **Embedded map**: no Google Map markup found on current contact page → provide a new map embed or static map (address is known).

## 5. Structural notes
- Projects live in a non-REST `sh_projects` CPT — captured by HTML crawl. Category taxonomy was reconstructed from card CSS classes + `see-more` labels (see `site-structure.json`).
- Legacy WPBakery shortcodes (`[vc_row]…`) pollute several page bodies; stripped during normalization.

## Consolidated decisions needed at Checkpoint 1 → carried to Checkpoint 3
1. New SEO copy for all pages/projects — approve approach.
2. Instagram link: supply URL or drop the icon.
3. Contact email address + form endpoint choice.
4. Keep, rewrite, or drop the thin `architectural-designs` project entry.
5. Confirm client display names (filename-derived).
