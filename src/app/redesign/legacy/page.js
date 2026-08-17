import { asset } from '@/lib/asset';
import data from '@/data/content.json';
import RedesignBar from '@/components/redesign/RedesignBar';

export const metadata = { title: 'Direction C — Legacy · DMF', robots: { index: false } };
const NAV = ['Expertise', 'Projects', 'About', 'Contact'];
const INK = '#17233B';
const ACCENT = '#9A2A2A';

export default function Legacy() {
  const s = data.stats;
  const projects = data.flagships.slice(0, 4);
  const feature = projects[0];
  return (
    <div className="min-h-screen bg-[#F7F4EE] font-body" style={{ color: INK }}>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#F7F4EE]/90 backdrop-blur">
        <div className="mx-auto flex h-[88px] max-w-6xl items-center justify-between px-6">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-12 w-auto" />
          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => <span key={n} className="text-[13px] font-medium uppercase tracking-wider" style={{ color: INK, opacity: 0.7 }}>{n}</span>)}
          </nav>
          <span className="border px-5 py-2.5 text-[13px] font-medium uppercase tracking-wider" style={{ borderColor: INK }}>Enquire</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Engineering consultants · Dubai</p>
            <h1 className="mt-6 font-fraunces text-6xl font-medium leading-[1.02] md:text-7xl" style={{ color: INK }}>
              The foundations of better places.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed" style={{ color: INK, opacity: 0.72 }}>
              For {s.total_projects} developments across {s.countries_served} countries, DMF has engineered the master plans, roads and infrastructure beneath the cities of the Gulf.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <span className="px-7 py-3.5 text-sm font-medium text-white" style={{ background: INK }}>View the portfolio</span>
              <span className="text-sm font-medium underline underline-offset-4" style={{ color: ACCENT }}>How we work</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <img src={asset(feature.hero)} alt={feature.name} className="h-[60vh] w-full object-cover" style={{ filter: 'saturate(0.9) contrast(1.02)' }} />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="grid grid-cols-3 border-y" style={{ borderColor: `${INK}22` }}>
          {[[s.total_projects, 'Projects'], [s.countries_served, 'Countries'], [Object.keys(s.disciplines).length, 'Disciplines']].map(([n, l]) => (
            <div key={l} className="py-10 text-center">
              <div className="font-fraunces text-6xl font-medium" style={{ color: INK }}>{n}</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest" style={{ color: INK, opacity: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Selected work</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {projects.map((p) => (
            <article key={p.slug} className="group">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={asset(p.thumb || p.hero)} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" style={{ filter: 'saturate(0.92)' }} />
              </div>
              <h3 className="mt-4 font-fraunces text-2xl font-medium" style={{ color: INK }}>{p.name}</h3>
              <p className="mt-1 text-sm" style={{ color: INK, opacity: 0.6 }}>{p.disciplines[0]}{p.location ? ` · ${p.location}` : ''}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto my-28 max-w-4xl px-6 text-center">
        <blockquote className="font-fraunces text-4xl font-medium leading-tight md:text-5xl" style={{ color: INK }}>
          &ldquo;Innovation, expertise and dedication converge to redefine excellence.&rdquo;
        </blockquote>
        <span className="mt-10 inline-block px-8 py-4 text-sm font-medium text-white" style={{ background: ACCENT }}>Start a conversation</span>
      </section>

      <footer className="border-t py-10" style={{ borderColor: `${INK}18` }}>
        <div className="mx-auto max-w-6xl px-6 text-sm" style={{ color: INK, opacity: 0.5 }}>© {new Date().getFullYear()} DMF Engineering · Baniyas Road, Deira, Dubai, UAE</div>
      </footer>
      <RedesignBar current="C" />
    </div>
  );
}
