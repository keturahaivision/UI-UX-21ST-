// Verify every extracted project & page is present in the build output.
import fs from 'node:fs';
const content = JSON.parse(fs.readFileSync('src/data/content.json', 'utf8'));
const extracted = JSON.parse(fs.readFileSync('extraction/content/projects-all.json', 'utf8'));
const extractedSlugs = new Set(extracted.map((p) => p.slug));
const builtSlugs = new Set(content.projects.map((p) => p.slug));
const missing = [...extractedSlugs].filter((s) => !builtSlugs.has(s));
const extra = [...builtSlugs].filter((s) => !extractedSlugs.has(s));
const noImg = content.projects.filter((p) => !p.hero).map((p) => p.slug);
const emptyGallery = content.projects.filter((p) => p.gallery.length === 0).map((p) => p.slug);
console.log(`Extracted projects: ${extractedSlugs.size}`);
console.log(`Built projects:     ${builtSlugs.size}`);
console.log(`Missing in build:   ${missing.length} ${missing.join(', ')}`);
console.log(`Extra in build:     ${extra.length}`);
console.log(`Projects w/o hero:  ${noImg.length} ${noImg.join(', ')}`);
console.log(`Empty galleries:    ${emptyGallery.length} ${emptyGallery.join(', ')}`);
console.log(`Services: ${content.services.length} | Clients: ${content.clients.length} | Flagships: ${content.flagships.length}`);
console.log(missing.length === 0 ? 'PARITY OK — zero silent losses' : 'PARITY FAIL');
