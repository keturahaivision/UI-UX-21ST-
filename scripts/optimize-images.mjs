// Convert referenced source images (extraction/assets/files) -> optimized WebP in public/images
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const content = JSON.parse(fs.readFileSync('src/data/content.json', 'utf8'));
const SRC = 'extraction/assets/files';
const OUT = 'public/images';
fs.mkdirSync(OUT, { recursive: true });

// collect referenced webp public paths
const want = new Set();
const add = (p) => { if (p && p.startsWith('/images/')) want.add(p.slice('/images/'.length)); };
for (const p of content.projects) { add(p.hero); add(p.thumb); (p.gallery||[]).forEach((g)=>add(g.src)); }
for (const c of content.clients) add(c.logo);

const srcFiles = fs.existsSync(SRC) ? new Set(fs.readdirSync(SRC)) : new Set();
let ok=0, miss=0, skip=0;
const missing=[];
for (const webp of want) {
  const outPath = path.join(OUT, webp);
  if (fs.existsSync(outPath)) { skip++; continue; }
  // source: same basename with original ext
  const stem = webp.replace(/\.webp$/, '');
  const cand = [...srcFiles].find((f) => f.replace(/\.(jpe?g|png|gif|webp)$/i,'') === stem);
  if (!cand) { miss++; missing.push(webp); continue; }
  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(path.join(SRC, cand)).rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(outPath);
    ok++;
  } catch (e) { miss++; missing.push(webp + ' ('+e.message+')'); }
}
console.log(`WebP: ${ok} converted, ${skip} existed, ${miss} missing of ${want.size} referenced`);
if (missing.length) console.log('First missing:', missing.slice(0,8));
