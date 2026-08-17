import { asset } from '@/lib/asset';
import data from '@/data/content.json';
import RedesignBar from '@/components/redesign/RedesignBar';

export const metadata = { title: 'Direction · Refined · DMF', robots: { index: false } };
const NAV = ['Expertise', 'Projects', 'About', 'Partnerships', 'Contact'];
const ACCENT = '#C4202B'; // refined DMF red

export default function Refined() {
  const s = data.stats;
  const projects = data.flagships.slice(0, 6);
  const disciplines = Object.entries(s.disciplines);
  return (
    <div className="min-h-screen bg-[#FBFAF8] font-body text-[#1A1A1A]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#FBFAF8]/85 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1220px] items-center justify-between px-6">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-11 w-auto" />
          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => <span key={n} className="text-[13px] font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A]">{n}</span>)}
          </nav>
          <span className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-white" style={{ background: ACCENT }}>Start a project</span>
        </div>
      </header>

      {/* Hero — editorial serif on clean light, imagery-led */}
      <section className="mx-auto max-w-[1220px] px-6 pt-16 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>Engineering &amp; infrastructure consultants · Dubai</p>
            <h1 className="mt-6 font-fraunces text-[3.4rem] font-medium leading-[1.02] tracking-[-0.01em] text-[#1A1A1A] md:text-[5.2rem]">
              We engineer what makes development possible.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#1A1A1A]/65">
              Master planning, roads &amp; infrastructure, traffic, civil, structural, architecture and landscape — the systems beneath {s.total_projects} developments across the UAE and the Gulf.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <span className="rounded-full bg-[#1A1A1A] px-7 py-3.5 text-sm font-semibold text-white">Explore our work</span>
              <span className="text-sm font-semibold underline underline-offset-4" style={{ color: ACCENT }}>How we work →</span>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[1.25rem]">
              <img src={asset(projects[0].hero)} alt={projects[0].name} className="h-[60vh] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-5 rounded-xl bg-white px-5 py-3 shadow-lg ring-1 ring-black/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>{projects[0].disciplines[0]}</p>
              <p className="text-sm font-semibold">{projects[0].name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — quiet rule */}
      <section className="mx-auto mt-28 max-w-[1220px] px-6">
        <div className="grid grid-cols-3 gap-6 border-y border-black/10 py-10">
          {[[s.total_projects, 'Projects delivered'], [s.countries_served, 'Countries served'], [disciplines.length, 'Engineering disciplines']].map(([n, l]) => (
            <div key={l}>
              <div className="font-fraunces text-5xl font-medium md:text-6xl">{n}</div>
              <div className="mt-2 text-sm font-medium text-[#1A1A1A]/50">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Expertise teaser */}
      <section className="mx-auto mt-24 max-w-[1220px] px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>What we do</p>
            <h2 className="mt-4 font-fraunces text-4xl font-medium leading-tight md:text-5xl">Where master planning meets infrastructure.</h2>
          </div>
          <div className="flex flex-wrap content-start gap-2.5">
            {disciplines.map(([k, v]) => (
              <span key={k} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium">
                {k} <span className="ml-1 text-[#1A1A1A]/40">{String(v).padStart(2, '0')}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Work grid */}
      <section className="mx-auto mt-24 max-w-[1220px] px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-fraunces text-4xl font-medium md:text-5xl">Selected work</h2>
          <span className="text-sm font-semibold" style={{ color: ACCENT }}>All {s.total_projects} projects →</span>
        </div>
        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.slug} className="group">
              <div className="aspect-[4/3] overflow-hidden rounded-[1rem]">
                <img src={asset(p.thumb || p.hero)} alt={p.name} className="h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>{p.disciplines[0]}</p>
              <h3 className="mt-1.5 font-fraunces text-xl font-medium">{p.name}</h3>
              {p.location && <p className="mt-0.5 text-sm text-[#1A1A1A]/50">{p.location}</p>}
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto my-28 max-w-[1220px] px-6">
        <div className="overflow-hidden rounded-[1.5rem] bg-[#1A1A1A] px-10 py-20 text-center">
          <h2 className="mx-auto max-w-3xl font-fraunces text-4xl font-medium text-white md:text-6xl">Have a development to engineer?</h2>
          <p className="mx-auto mt-5 max-w-lg text-white/60">Tell us about your project — master plan to movement, we’ll take it from the ground up.</p>
          <span className="mt-9 inline-block rounded-full px-8 py-4 text-sm font-semibold text-white" style={{ background: ACCENT }}>Start a conversation</span>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] py-10">
        <div className="mx-auto flex max-w-[1220px] flex-col justify-between gap-2 px-6 text-sm text-[#1A1A1A]/50 md:flex-row">
          <span>© {new Date().getFullYear()} DMF Engineering</span>
          <span>Baniyas Road, Green Tower, Deira, Dubai, UAE · +971 4 227 2525</span>
        </div>
      </footer>
      <RedesignBar current="R" />
    </div>
  );
}
