# DMF Engineering — Functional Inventory (Source: dmfeng.com)

Behaviours observed on the live source site, to be reproduced (or deliberately re-imagined) in the rebuild.

## Global
- **Preloader / "Loading…"**: every page renders a `Loading...` state before content — a simple loader, no percentage counter. (Reference site adds a 0→100% counter; we will upgrade this.)
- **Header nav**: fixed top bar — Home / Projects / Services / About Us / Contact Us. Logo (`DMF-BNP-logo2.png`) links home. Duplicated markup suggests a desktop bar + mobile drawer.
- **Footer**: DMF ethos quote, LinkedIn icon (real URL), Instagram icon (`#` placeholder — **flagged**), copyright `©2025 DMF Engineering`.

## Home
- **Hero image slider**: full-bleed rotating background images cycling through flagship projects. 8 unique hero images captured (Bawabat, Salamah, Nadd Al Hamar, Porto Island, Euro University, Al Hamra Avenue, Jebel Ali, Al Ahli). One image referenced over **http://** (mixed content — fixed in manifest to https).
- **Recent Projects**: a 7-item grid of the newest projects with name + category, linking to `/sh_projects/{slug}/`.
- **CTA band**: "Go ahead and find out how we can help you! — Meet our office / Get in Touch".

## Projects archive (`/projects/`)
- **Paginated grid**: 7 projects per page × 8 pages = **51 projects**. Each card = background-image thumbnail + title (`h2.project-title`) + category (`span.see-more`) + hover "see more" fade.
- **Category encoding**: each card carries CSS classes for its disciplines (`roads masterplan supervision …`) — the basis for a client-side filter in the rebuild (source had no visible filter UI).
- **Pagination**: classic `« Previous 1 2 3 … 8 Next »`.

## Project detail (`/sh_projects/{slug}/`)
- Hero image, project title, scope tagline, description paragraph.
- **PROJECT DETAILS** block: Type of service / Client / Size / Location / Completion date (label set varies per project).
- **Image gallery**: 2–17 images per project (avg ~8), rendered as a grid/slider. No lightbox markup detected (static grid).
- **Prev/Next project** navigation at the foot ("Previous Project" / "Next Project").
- Footer ethos quote repeated.

## Services (`/services/`)
- Long-form page listing 10 disciplines, each a heading + descriptive paragraph. Also exposed individually as WordPress posts.

## About (`/about/`)
- "Who we Are" narrative, founder mention (David Ghosheh), Mission / Vision / Values, "What We Do" grid of the 10 services.

## Our Clients (`/our-clients/`)
- Logo wall — **15 client logos** (TECOM, Sobha Realty, RTA, Reportage, Nujoom, Marhaba, Sharjah Waterfront City, Grandhills, etc.). Logos have **empty alt text** (accessibility gap — flagged).

## Contact (`/contact/`)
- Contact details (Dubai office address, phone), "Find us on" social row, and a **contact form** (Name / Email / Subject / Message inferred) posting via jQuery AJAX to a form action, rendering an inline `.msgs` response. No embedded Google Map detected in current markup.

## Extraction method coverage
| Content | Method | Notes |
|---|---|---|
| Pages (8), Services posts (10) | WP REST API `/wp/v2/pages`, `/wp/v2/posts` | Full, reliable |
| Media dimensions (749 on site) | REST count + direct download | 484 referenced assets downloaded |
| Projects (51) | **HTML crawl fallback** | `sh_projects` CPT is **not** REST-exposed |
| Nav / footer / contact / clients | HTML parse | REST menus endpoint requires auth |
