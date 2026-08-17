import { asset } from '@/lib/asset';
import data from '@/data/content.json';
import RedesignBar from '@/components/redesign/RedesignBar';

export const metadata = { title: 'Direction A — Clarity · DMF', robots: { index: false } };
const NAV = ['Expertise', 'Projects', 'About', 'Contact'];

export default function Clarity() {
  const s = data.stats;
  const projects = data.flagships.slice(0, 6);
  return (
    <div className="min-h-screen bg-white font-lexend text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-12 w-auto" />
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => <span key={n} className="text-sm font-medium text-neutral-600 hover:text-neutral-900">{n}</span>)}
          </nav>
          <span className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white">Start a project</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Engineering &amp; infrastructure · Dubai</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-neutral-900 md:text-7xl">
            We engineer what makes development possible.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Master planning, roads &amp; infrastructure, traffic, civil, structural, architecture and landscape — delivered across the UAE and the Gulf for {s.total_projects} developments and counting.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <span className="rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white">Explore our work</span>
            <span className="rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-semibold text-neutral-800">Our expertise</span>
          </div>
        </div>
        <div className="mt-14 overflow-hidden rounded-2xl">
          <img src={asset(projects[0].hero)} alt={projects[0].name} className="h-[52vh] w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="grid grid-cols-3 gap-8 rounded-2xl bg-neutral-50 p-10">
          {[[s.total_projects, 'Projects delivered'], [s.countries_served, 'Countries'], [Object.keys(s.disciplines).length, 'Disciplines']].map(([n, l]) => (
            <div key={l}>
              <div className="text-5xl font-bold text-neutral-900">{n}</div>
              <div className="mt-2 text-sm font-medium text-neutral-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Selected work</h2>
          <span className="text-sm font-semibold text-red-600">View all {s.total_projects} projects →</span>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.slug} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-shadow hover:shadow-xl">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={asset(p.thumb || p.hero)} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600">{p.disciplines[0]}</p>
                <h3 className="mt-2 text-xl font-semibold">{p.name}</h3>
                {p.location && <p className="mt-1 text-sm text-neutral-500">{p.location}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto my-24 max-w-7xl px-6">
        <div className="rounded-3xl bg-neutral-900 px-10 py-16 text-center">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold text-white md:text-5xl">Have a development to engineer?</h2>
          <span className="mt-8 inline-block rounded-full bg-red-600 px-8 py-4 text-sm font-semibold text-white">Start a conversation</span>
        </div>
      </section>

      <footer className="border-t border-neutral-100 py-10">
        <div className="mx-auto max-w-7xl px-6 text-sm text-neutral-500">© {new Date().getFullYear()} DMF Engineering · Dubai, UAE</div>
      </footer>
      <RedesignBar current="A" />
    </div>
  );
}
