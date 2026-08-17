import Link from 'next/link';
import NeonMasterplanHero from '@/components/home/NeonMasterplanHero';
import ProjectMap from '@/components/home/ProjectMap';
import Reveal from '@/components/motion/Reveal';
import StatCounter from '@/components/ui/StatCounter';
import { pageMeta } from '@/lib/seo';
import data from '@/data/content.json';
import { asset } from '@/lib/asset';

export const metadata = pageMeta({
  description: 'DMF Engineering works at the level beneath successful development — master planning, roads & infrastructure, traffic, civil, structural, architecture and landscape across the UAE and the Gulf.',
});

const DISCIPLINE_ORDER = ['Master Plan', 'Roads & Infrastructure', 'Traffic', 'Structural', 'Architectural', 'Landscape', 'Supervision'];
const PROCESS = [
  ['Understand', 'Site, brief, authorities and constraints — before a line is drawn.'],
  ['Plan', 'Master planning and land use that make the numbers and the movement work.'],
  ['Engineer', 'Roads, infrastructure, civil and structural design, coordinated as one.'],
  ['Deliver', 'Approvals secured and construction supervised, on time and on budget.'],
];

// Masterplan plan-view / model images — the best candidates for neon capture.
const MP_RE = /master[-_ ]?plan|mp[-_.]|[-_]mp[0-9]?\.|mp-model|coloring-model|masterplan/i;
function masterplanFrames() {
  const seen = new Set();
  const out = [];
  for (const p of data.projects) {
    if (!p.disciplines?.includes('Master Plan')) continue;
    const img = (p.gallery || []).map((g) => g.src).find((sctr) => MP_RE.test(sctr));
    if (!img || seen.has(img)) continue;
    seen.add(img);
    out.push({ name: p.name, location: p.location, img });
  }
  return out.slice(0, 8);
}

export default function HomePage() {
  const s = data.stats;
  const mpFrames = masterplanFrames();
  const work = data.flagships.slice(0, 6);
  const scaleImg = data.flagships[2]?.hero || data.flagships[0].hero;
  const disciplines = DISCIPLINE_ORDER.filter((d) => s.disciplines[d]).map((d) => [d, s.disciplines[d]]);

  return (
    <div className="bg-brand-coal text-white">
      {/* ── 01 · Neon masterplan hero (scroll-evolving) ── */}
      <NeonMasterplanHero frames={mpFrames} />

      {/* ── 02 · Positioning ───────────────────────── */}
      <section className="border-t border-brand-hair bg-brand-coal">
        <div className="u-container py-28 md:py-32">
          <Reveal><p className="r-eyebrow">Our position</p></Reveal>
          <Reveal delay={80}>
            <p className="mt-6 max-w-4xl r-h text-[1.9rem] leading-[1.22] text-white md:text-[2.9rem]">
              These are the people who understand what has to happen
              <span className="text-brand-red"> beneath the development </span>
              for the development to work.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-2xl font-ptsans text-lg leading-relaxed text-white/60">
              Master planning, roads &amp; infrastructure, traffic, civil, structural, architecture and
              landscape — the systems beneath {s.total_projects} developments across the UAE and the Gulf.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 03 · Expertise ─────────────────────────── */}
      <section className="border-t border-brand-hair bg-brand-surface">
        <div className="u-container py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Reveal><p className="r-eyebrow">What we do</p></Reveal>
              <Reveal delay={80}><h2 className="mt-4 r-h text-4xl text-white md:text-5xl">Where master planning meets infrastructure.</h2></Reveal>
              <Reveal delay={140}><Link href="/expertise" className="mt-6 inline-block font-raleway text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-red">All disciplines →</Link></Reveal>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {disciplines.map(([k, v], i) => (
                <Reveal key={k} delay={i * 60}>
                  <Link href={`/projects?d=${encodeURIComponent(k)}`}
                    className="tile tile-hover flex h-full flex-col justify-between rounded-xl p-4">
                    <span className="font-raleway text-[13px] font-bold text-brand-red">{String(v).padStart(2, '0')}</span>
                    <span className="mt-6 font-raleway text-sm font-semibold leading-tight text-white">{k}</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · Interactive regional map ──────────── */}
      <section className="border-t border-brand-hair bg-brand-coal">
        <div className="u-container py-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Reveal><p className="r-eyebrow">Regional footprint</p></Reveal>
              <Reveal delay={80}><h2 className="mt-3 r-h text-4xl text-white md:text-5xl">{s.total_projects} projects, mapped.</h2></Reveal>
            </div>
            <Reveal delay={120}><Link href="/projects" className="hidden font-raleway text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-red md:inline-block">Open the portfolio →</Link></Reveal>
          </div>
          <Reveal delay={120}><ProjectMap height={520} /></Reveal>
        </div>
      </section>

      {/* ── 05 · Selected work ─────────────────────── */}
      <section className="border-t border-brand-hair bg-brand-surface">
        <div className="u-container py-24">
          <div className="flex items-end justify-between">
            <div>
              <Reveal><p className="r-eyebrow">Selected work</p></Reveal>
              <Reveal delay={80}><h2 className="mt-3 r-h text-4xl text-white md:text-5xl">The developments DMF made possible.</h2></Reveal>
            </div>
            <Reveal delay={120}><Link href="/projects" className="font-raleway text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-red">All {s.total_projects} →</Link></Reveal>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {work.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand-hair bg-brand-ink">
                    <img src={asset(p.thumb || p.hero)} alt={p.name} loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-transform duration-[700ms] ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.06] group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-coal/70 via-transparent to-transparent" />
                  </div>
                  <p className="mt-4 font-raleway text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-red">{p.disciplines[0]}</p>
                  <h3 className="mt-1 r-h text-xl text-white">{p.name}</h3>
                  {p.location && <p className="mt-0.5 font-ptsans text-sm text-white/50">{p.location}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 · Scale (image-backed) ──────────────── */}
      <section className="relative overflow-hidden border-t border-brand-hair bg-brand-coal">
        <img src={asset(scaleImg)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-coal via-brand-coal/85 to-brand-coal" />
        <div className="u-container relative py-24">
          <Reveal><p className="r-eyebrow">Scale</p></Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[[s.total_projects, 'Projects delivered'], [s.countries_served, 'Countries served'], [disciplines.length, 'Disciplines'], [s.total_gallery_images || 300, 'Project records']].map(([n, l], i) => (
              <Reveal key={l} delay={i * 80}>
                <div className="tile rounded-2xl p-6"><StatCounter value={n} label={l} /></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 · How we work ───────────────────────── */}
      <section className="border-t border-brand-hair bg-brand-surface">
        <div className="u-container py-24">
          <Reveal><p className="r-eyebrow">How we work</p></Reveal>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {PROCESS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 70}>
                <div className="tile h-full rounded-2xl p-6">
                  <span className="font-raleway text-2xl font-extrabold text-brand-red">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 font-raleway text-lg font-bold text-white">{t}</h3>
                  <p className="mt-2 font-ptsans text-sm leading-relaxed text-white/60">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 08 · Clients ───────────────────────────── */}
      {data.clients?.some((c) => c.logo) && (
        <section className="border-t border-brand-hair bg-brand-coal">
          <div className="u-container py-20">
            <Reveal><p className="r-eyebrow">Trusted by</p></Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {data.clients.filter((c) => c.logo).map((c, i) => (
                <Reveal key={c.logo} delay={(i % 5) * 50}>
                  <div className="flex items-center justify-center rounded-xl bg-white/90 p-6">
                    <img src={asset(c.logo)} alt={c.name || 'DMF Engineering client'} loading="lazy"
                      className="max-h-11 w-auto opacity-80 transition hover:opacity-100" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 09 · CTA (image-backed) ────────────────── */}
      <section className="relative overflow-hidden border-t border-brand-hair bg-brand-coal">
        <img src={asset(data.flagships[0].hero)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-coal/80 via-brand-coal/70 to-brand-coal" />
        <div className="u-container relative py-28 text-center">
          <Reveal><h2 className="mx-auto max-w-3xl r-h text-4xl text-white md:text-6xl">Have a development to engineer?</h2></Reveal>
          <Reveal delay={100}><p className="mx-auto mt-5 max-w-lg font-ptsans text-white/60">From master plan to movement, we take it from the ground up.</p></Reveal>
          <Reveal delay={180}>
            <Link href="/contact" className="mt-9 inline-block rounded-full bg-brand-red px-8 py-4 font-raleway text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-transform hover:-translate-y-0.5">
              Start a conversation
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
