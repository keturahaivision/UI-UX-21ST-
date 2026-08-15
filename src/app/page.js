import Link from 'next/link';
import StatCounter from '@/components/ui/StatCounter';
import { pageMeta } from '@/lib/seo';
import data from '@/data/content.json';
import { asset } from '@/lib/asset';

export const metadata = pageMeta({
  description: 'DMF Engineering works at the level beneath successful development — master planning, roads & infrastructure, traffic, civil, structural, architecture and landscape across the UAE and the Gulf.',
});

// The development lifecycle DMF operates across — the persistent "systems spine".
const SPINE = [
  { phase: 'Plan', disciplines: ['Master Plan'], note: 'Land use, feasibility, approvals — before a line is drawn.' },
  { phase: 'Move', disciplines: ['Roads & Infrastructure', 'Traffic'], note: 'Networks, mobility and the systems that carry a city.' },
  { phase: 'Build', disciplines: ['Structural', 'Architectural'], note: 'Civil, structural and architectural engineering, coordinated.' },
  { phase: 'Sustain', disciplines: ['Landscape', 'Supervision'], note: 'Landscape and on-site supervision through delivery.' },
];
const DISCIPLINE_ORDER = ['Master Plan', 'Roads & Infrastructure', 'Traffic', 'Structural', 'Architectural', 'Landscape', 'Supervision'];
const PROCESS = [
  ['Understand', 'Site, brief, authorities and constraints — before a line is drawn.'],
  ['Plan', 'Master planning and land use that make the numbers and the movement work.'],
  ['Engineer', 'Roads, infrastructure, civil and structural design, coordinated as one.'],
  ['Deliver', 'Approvals secured and construction supervised, on time and on budget.'],
];

export default function HomePage() {
  const s = data.stats;
  const hero = data.flagships[0];
  const work = data.flagships.slice(0, 6);
  const disciplines = DISCIPLINE_ORDER.filter((d) => s.disciplines[d]).map((d) => [d, s.disciplines[d]]);

  return (
    <div className="bg-sys-ground text-sys-ink">
      {/* ── Cinematic hero ─────────────────────────────── */}
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <img src={asset(hero.hero)} alt={hero.name} className="absolute inset-0 h-full w-full object-cover opacity-[0.38]" />
        <div className="absolute inset-0 bg-gradient-to-b from-sys-ground/70 via-sys-ground/55 to-sys-ground" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(120%_80%_at_50%_10%,#000_30%,transparent_80%)]" />

        <div className="u-container relative flex min-h-[100svh] flex-col justify-end pb-16 pt-32">
          <p className="r-eyebrow">Engineering &amp; infrastructure consultants · Dubai</p>
          <h1 className="mt-6 max-w-[16ch] r-h text-[3rem] leading-[0.98] sm:text-[4.2rem] md:text-[5.6rem]">
            Engineering the systems that make development possible.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-sys-muted">
            The masterplanning, roads, traffic, civil, structural, architecture and landscape
            beneath {s.total_projects} developments across the UAE and the Gulf.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/projects" className="rounded-full bg-sys-red px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5">
              Explore the work
            </Link>
            <Link href="/expertise" className="font-mono text-[12px] uppercase tracking-[0.12em] text-sys-red">How we work →</Link>
          </div>

          {/* Floating glass stat tiles */}
          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-3">
            {[[s.total_projects, 'Projects'], [s.countries_served, 'Countries'], [disciplines.length, 'Disciplines']].map(([n, l]) => (
              <div key={l} className="tile rounded-xl px-5 py-4">
                <div className="font-display text-3xl font-bold tabular-nums leading-none md:text-4xl">{String(n).padStart(2, '0')}</div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-sys-faint">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* current project readout — engineered metadata tile */}
        <Link href={`/projects/${hero.slug}`} className="tile tile-hover absolute bottom-8 right-6 hidden rounded-xl px-5 py-4 lg:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sys-red">Project · Featured</p>
          <p className="mt-1.5 font-display text-base font-bold">{hero.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-sys-faint">{hero.location}</p>
        </Link>
      </section>

      {/* ── Positioning ────────────────────────────────── */}
      <section className="u-container py-28">
        <p className="r-eyebrow">Our position</p>
        <p className="mt-6 max-w-4xl font-display text-3xl font-medium leading-[1.2] tracking-[-0.015em] md:text-[2.9rem]">
          These are the people who understand what has to happen
          <span className="text-sys-red"> beneath the development </span>
          for the development to work.
        </p>
      </section>

      {/* ── Systems spine ──────────────────────────────── */}
      <section className="u-container pb-8">
        <div className="flex items-baseline justify-between">
          <p className="r-eyebrow">The systems spine</p>
          <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-sys-faint md:flex">
            <span>Plan</span><span className="text-sys-red">→</span><span>Move</span><span className="text-sys-red">→</span><span>Build</span><span className="text-sys-red">→</span><span>Sustain</span>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {SPINE.map((step, i) => (
            <div key={step.phase} className="tile rounded-2xl p-6">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-sys-red">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-sys-faint">Phase</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold">{step.phase}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sys-muted">{step.note}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {step.disciplines.map((d) => (
                  <span key={d} className="rounded-full border border-sys-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-sys-muted">{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Expertise tiles ────────────────────────────── */}
      <section className="u-container py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="r-eyebrow">What we do</p>
            <h2 className="mt-4 r-h text-4xl md:text-5xl">Where master planning meets infrastructure.</h2>
            <Link href="/expertise" className="mt-6 inline-block font-mono text-[12px] uppercase tracking-[0.12em] text-sys-red">All disciplines →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {disciplines.map(([k, v]) => (
              <Link key={k} href={`/projects?d=${encodeURIComponent(k)}`}
                className="tile tile-hover flex flex-col justify-between rounded-xl p-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-sys-red">{String(v).padStart(2, '0')}</span>
                <span className="mt-6 text-sm font-medium leading-tight text-sys-ink">{k}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects explorer ──────────────────────────── */}
      <section className="u-container py-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="r-eyebrow">Selected work</p>
            <h2 className="mt-3 r-h text-4xl md:text-5xl">The developments DMF made possible.</h2>
          </div>
          <Link href="/projects" className="font-mono text-[12px] uppercase tracking-[0.12em] text-sys-red">All {s.total_projects} →</Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="group relative overflow-hidden rounded-2xl border border-sys-line">
              <div className="aspect-[4/3] overflow-hidden bg-sys-panel2">
                <img src={asset(p.thumb || p.hero)} alt={p.name} loading="lazy"
                  className="h-full w-full object-cover opacity-90 transition-transform duration-[600ms] group-hover:scale-[1.05]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-sys-ground via-sys-ground/10 to-transparent" />
              {/* glass metadata tile slides up on hover */}
              <div className="absolute inset-x-3 bottom-3 tile rounded-xl px-4 py-3 transition-transform duration-500 ease-settle md:translate-y-2 md:opacity-90 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sys-red">{p.disciplines[0]}</p>
                <p className="mt-1 font-display text-base font-bold leading-tight">{p.name}</p>
                {p.location && <p className="mt-0.5 font-mono text-[11px] text-sys-faint">{p.location}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Scale ──────────────────────────────────────── */}
      <section className="u-container py-24">
        <p className="r-eyebrow">Scale</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[[s.total_projects, 'Projects delivered'], [s.countries_served, 'Countries served'], [disciplines.length, 'Disciplines'], [s.total_gallery_images || 300, 'Project records']].map(([n, l]) => (
            <div key={l} className="tile rounded-2xl p-6">
              <StatCounter value={n} label={l} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ────────────────────────────────────── */}
      <section className="u-container pb-24">
        <p className="r-eyebrow">How we work</p>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {PROCESS.map(([t, d], i) => (
            <div key={t} className="tile rounded-2xl p-6">
              <span className="font-display text-2xl font-bold text-sys-red">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sys-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Clients ────────────────────────────────────── */}
      {data.clients?.some((c) => c.logo) && (
        <section className="u-container pb-24">
          <p className="r-eyebrow">Trusted by</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.clients.filter((c) => c.logo).map((c) => (
              <div key={c.logo} className="tile flex items-center justify-center rounded-xl p-6">
                <img src={asset(c.logo)} alt={c.name || 'DMF Engineering client'} loading="lazy"
                  className="max-h-10 w-auto opacity-70 brightness-0 invert transition hover:opacity-100" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="u-container pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-sys-line bg-sys-panel px-8 py-20 text-center md:px-10">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl r-h text-4xl md:text-6xl">Have a development to engineer?</h2>
            <p className="mx-auto mt-5 max-w-lg text-sys-muted">
              From master plan to movement, we take it from the ground up.
            </p>
            <Link href="/contact" className="mt-9 inline-block rounded-full bg-sys-red px-8 py-4 font-mono text-[12px] uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5">
              Start a conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
