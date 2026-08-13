# Phase 03 — Content Model

Content lives in structured files (`src/data/`, `content/`), never hardcoded in components. Every project, service, and partner is independently editable. Each content type below maps to a schema and, for factual fields, to an entry in `data/content-source-registry.json`.

## Types

### Project (`content/projects/*` → `src/data/content.json`)
`slug, name, scope, description, disciplines[], disciplineDisplay, client, location, country, size, completion, hero, gallery[{src,alt}], thumb, coordinates{lat,lng}?, related[]`
- **Status now:** 51 records populated from extraction. `coordinates` = NEW (needed for the Mapbox map; geocode verified locations only, mark conceptual otherwise).

### Service / Discipline (`src/data/content.json:services`)
`slug, name, description, capabilities[], relatedProjects[]`
- 10 services populated. `capabilities[]` + `relatedProjects[]` = NEW (derive relatedProjects from project.disciplines).

### Company (`content/company`)
`legalName, description, founded, leadership[{name,title,bio,photo}], offices[], disciplines[], geography[], licences[], certifications[], awards[], memberships[]`
- Mostly REQUIRES_CONFIRMATION → owner data request (Appendix A).

### Partner (`content/partners`)
`name, category(developer|architect|planner|contractor|specialist|authority|technology), relationshipTier(verified_relationship|project_collaboration|strategic_partnership|professional_network), logo?, evidence, projects[]`
- **Empty until verified.** Logos appear only with owner-confirmed permission + evidence. Tiers never blurred.

### Insight (`content/insights`)
`slug, title, category, date, author, body(MDX), hero`
- **New editorial only** — never fabricate historical publications. Launches with clearly-labeled new pieces.

### Role / Career (`content/careers`)
`title, discipline, location, type, description, apply`
- **Real open roles only** (owner-supplied).

## Provenance rule
Every factual field renders only if its registry entry is VERIFIED_* or USER_PROVIDED. REQUIRES_CONFIRMATION fields are held back or shown with owner sign-off. Decorative CAD/engineering-drawing graphics are labeled **conceptual**.
