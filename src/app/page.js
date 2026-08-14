import Link from 'next/link';
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

export default function HomePage() {
  const s = data.stats;
  const hero = data.flagships[0];
  const work = data.flagships.slice(0, 6);
  const disciplines = DISCIPLINE_ORDER
    .filter((d) => s.disciplines[d])
    .map((d) => [d, s.disciplines[d]]);

  return (
    <div className="bg-dmf-paper text-dmf-ink">
      {/* Hero — editorial serif on clean light, imagery-led */}
      <section className="u-container pt-32 md:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="r-eyebrow">Engineering &amp; infrastructure consultants · Dubai</p>
            <h1 className="mt-6 r-h text-[3.2rem] leading-[1.02] md:text-[5.2rem]">
              We engineer what makes development possible.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-dmf-ink/65">
              Master planning, roads &amp; infrastructure, traffic, civil, structural, architecture and
              landscape — the systems beneath {s.total_projects} developments across the UAE and the Gulf.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/projects" className="rounded-full bg-dmf-ink px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                Explore our work
              </Link>
              <Link href="/expertise" className="text-sm font-semibold text-dmf-red underline underline-offset-4">
                How we work →
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[1.25rem]">
              <img src={asset(hero.hero)} alt={hero.name} className="h-[58vh] min-h-[420px] w-full object-cover" />
            </div>
            <Link href={`/projects/${hero.slug}`} className="absolute -bottom-5 left-5 rounded-xl bg-white px-5 py-3 shadow-lg ring-1 ring-black/5 transition-transform hover:-translate-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-dmf-red">{hero.disciplines[0]}</p>
              <p className="text-sm font-semibold">{hero.name}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats rule */}
      <section className="u-container mt-28">
        <div className="grid grid-cols-3 gap-6 border-y border-black/10 py-10">
          <StatCounter value={s.total_projects} label="Projects delivered" />
          <StatCounter value={s.countries_served} label="Countries served" />
          <StatCounter value={disciplines.length} label="Engineering disciplines" />
        </div>
      </section>

      {/* Positioning statement */}
      <section className="u-container mt-24">
        <div className="max-w-4xl">
          <p className="r-eyebrow">Our position</p>
          <p className="mt-6 font-fraunces text-3xl font-medium leading-[1.25] tracking-[-0.01em] md:text-[2.75rem]">
            These are the people who understand what has to happen beneath the
            development for the development to work.
          </p>
        </div>
      </section>

      {/* Expertise pills */}
      <section className="u-container mt-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="r-eyebrow">What we do</p>
            <h2 className="mt-4 r-h text-4xl md:text-5xl">Where master planning meets infrastructure.</h2>
            <Link href="/expertise" className="mt-6 inline-block text-sm font-semibold text-dmf-red underline underline-offset-4">All disciplines →</Link>
          </div>
          <div className="flex flex-wrap content-start gap-2.5">
            {disciplines.map(([k, v]) => (
              <Link key={k} href={`/projects?d=${encodeURIComponent(k)}`}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-dmf-red hover:text-dmf-red">
                {k} <span className="ml-1 text-dmf-ink/40">{String(v).padStart(2, '0')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Selected work grid */}
      <section className="u-container mt-24">
        <div className="flex items-end justify-between">
          <h2 className="r-h text-4xl md:text-5xl">Selected work</h2>
          <Link href="/projects" className="text-sm font-semibold text-dmf-red">All {s.total_projects} projects →</Link>
        </div>
        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="group">
              <div className="aspect-[4/3] overflow-hidden rounded-[1rem] bg-black/[0.04]">
                <img src={asset(p.thumb || p.hero)} alt={p.name} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-dmf-red">{p.disciplines[0]}</p>
              <h3 className="mt-1.5 font-fraunces text-xl font-medium">{p.name}</h3>
              {p.location && <p className="mt-0.5 text-sm text-dmf-ink/50">{p.location}</p>}
            </Link>
          ))}
        </div>
      </section>

      {/* Process strip */}
      <section className="u-container mt-28">
        <p className="r-eyebrow">How we work</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-[1.25rem] bg-black/[0.06] md:grid-cols-4">
          {PROCESS.map(([t, d], i) => (
            <div key={t} className="bg-dmf-paper p-7">
              <span className="font-fraunces text-2xl font-medium text-dmf-red">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dmf-ink/60">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clients */}
      {data.clients?.some((c) => c.logo) && (
        <section className="u-container mt-24">
          <p className="r-eyebrow">Trusted by</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.clients.filter((c) => c.logo).map((c) => (
              <div key={c.logo} className="flex items-center justify-center rounded-xl border border-black/[0.06] bg-white p-6">
                <img src={asset(c.logo)} alt={c.name || 'DMF Engineering client'} loading="lazy"
                  className="max-h-11 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="u-container my-28">
        <div className="overflow-hidden rounded-[1.5rem] bg-dmf-ink px-8 py-20 text-center md:px-10">
          <h2 className="mx-auto max-w-3xl font-fraunces text-4xl font-medium text-white md:text-6xl">Have a development to engineer?</h2>
          <p className="mx-auto mt-5 max-w-lg text-white/60">
            Tell us about your project — from master plan to movement, we take it from the ground up.
          </p>
          <Link href="/contact" className="mt-9 inline-block rounded-full bg-dmf-red px-8 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
            Start a conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
