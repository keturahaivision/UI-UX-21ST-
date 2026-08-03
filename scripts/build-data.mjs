// Transforms extraction/content/* into typed data modules the app imports.
import fs from 'node:fs';
import path from 'node:path';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const projects = read('extraction/content/projects-all.json');
const services = read('extraction/content/services.json');
const stats = read('extraction/stats.json');
const site = read('extraction/site-structure.json');
const clients = read('extraction/content/clients.json');

// image url -> optimized public path (basename-based, webp)
const toPublic = (url) => {
  if (!url) return null;
  const base = url.split('/wp-content/uploads/').pop().replace(/[^A-Za-z0-9._-]/g, '_');
  return '/images/' + base.replace(/\.(jpe?g|png|gif)$/i, '.webp');
};

const DISCIPLINE_LABELS = {
  roads: 'Roads & Infrastructure', masterplan: 'Master Plan', supervision: 'Supervision',
  architectural: 'Architectural', 'architectural-design': 'Architectural',
  traffic: 'Traffic', landscape: 'Landscape', structural: 'Structural',
};
const primaryDisciplines = ['Roads & Infrastructure','Master Plan','Architectural','Structural','Traffic','Landscape','Supervision'];

const norm = projects.map((p) => {
  const disciplines = [...new Set(p.category_slugs.map((s) => DISCIPLINE_LABELS[s]).filter(Boolean))];
  const d = p.details || {};
  const location = d.Location || null;
  const country = location ? location.split(',').pop().trim() : null;
  const gallery = (p.gallery || []).map((g) => ({
    src: toPublic(g.url),
    alt: g.alt && g.alt.trim() ? g.alt.trim() : `${p.name} — DMF Engineering project`,
  })).filter((g) => g.src);
  const hero = toPublic(p.hero_image) || (gallery[0] && gallery[0].src) || null;
  return {
    slug: p.slug,
    name: p.name,
    scope: p.scope_tagline || d['Type of service'] || null,
    description: p.description && p.description.length > 15 ? p.description : null,
    disciplines,
    disciplineDisplay: p.category_display || disciplines.join(', '),
    location, country,
    client: d.Client || null,
    size: d.Size && !/^n\/?a$|^tbd$/i.test(d.Size) ? d.Size : null,
    completion: d['Completion date'] || null,
    hero, gallery,
    thumb: toPublic(p.thumbnail) || hero,
  };
});

// Flagship ordering for Chapter 5 + featured
const FLAGSHIP = ['nah','al-salamah','euro-university-bahrein','jebel-ali-development','bawabat-al-sharq-phase-5','hillside-library','al-ahli-club-master-plan','ordos-museus'];
const flagships = FLAGSHIP.map((s) => norm.find((p) => p.slug === s)).filter(Boolean);

const disciplineFilters = primaryDisciplines
  .map((label) => ({ label, count: norm.filter((p) => p.disciplines.includes(label)).length }))
  .filter((f) => f.count > 0);
const countryFilters = [...new Set(norm.map((p) => p.country).filter(Boolean))]
  .map((c) => ({ label: c, count: norm.filter((p) => p.country === c).length }))
  .sort((a, b) => b.count - a.count);

const out = {
  projects: norm,
  flagships,
  services,
  stats,
  clients: clients.map((c) => ({ name: c.name_guess, logo: toPublic(c.logo) })),
  filters: { disciplines: disciplineFilters, countries: countryFilters },
  site: {
    nav: site.nav,
    footer: site.footer,
    contact: site.contact,
  },
};
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/content.json', JSON.stringify(out, null, 2));
console.log(`Wrote src/data/content.json: ${norm.length} projects, ${services.length} services, ${flagships.length} flagships`);
console.log(`Filters: ${disciplineFilters.length} disciplines, ${countryFilters.length} countries`);
console.log(`Projects with description: ${norm.filter((p) => p.description).length}/${norm.length}`);
