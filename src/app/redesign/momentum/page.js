import { asset } from '@/lib/asset';
import data from '@/data/content.json';
import RedesignBar from '@/components/redesign/RedesignBar';

export const metadata = { title: 'Direction B — Momentum · DMF', robots: { index: false } };
const NAV = ['Expertise', 'Projects', 'About', 'Contact'];

export default function Momentum() {
  const s = data.stats;
  const projects = data.flagships.slice(0, 5);
  return (
    <div className="min-h-screen bg-[#F4F2EC] font-poppins text-[#161616]">
      <header className="sticky top-0 z-50 bg-[#F4F2EC]/85 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-12 w-auto" />
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => <span key={n} className="text-sm font-semibold text-[#161616]/70 hover:text-[#161616]">{n}</span>)}
          </nav>
          <span className="rounded-full bg-[#161616] px-5 py-2.5 text-sm font-semibold text-white">Let&apos;s talk</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-12 md:pt-16">
        <p className="text-sm font-bold uppercase tracking-widest text-[#D81F2A]">DMF · Engineering the roots of development</p>
        <h1 className="mt-6 text-[13vw] font-bold leading-[0.92] tracking-tight md:text-[8.5rem]">
          Beneath<br />every <span className="text-[#D81F2A]">city.</span>
        </h1>
        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="overflow-hidden rounded-[2rem]">
            <img src={asset(projects[0].hero)} alt={projects[0].name} className="h-[46vh] w-full object-cover" />
          </div>
          <div>
            <p className="text-xl font-medium leading-relaxed text-[#161616]/80">
              The roads, utilities, drainage, mobility and master planning that make a development work — engineered by DMF across the UAE and the Gulf.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#D81F2A] px-6 py-3 text-sm font-semibold text-white">See the work</span>
              <span className="rounded-full border-2 border-[#161616] px-6 py-3 text-sm font-semibold">Our expertise</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[[s.total_projects, 'Projects delivered', 'bg-[#D81F2A] text-white'], [s.countries_served, 'Countries served', 'bg-[#161616] text-white'], [Object.keys(s.disciplines).length, 'Disciplines', 'bg-white text-[#161616]']].map(([n, l, c]) => (
            <div key={l} className={`rounded-[1.75rem] p-9 ${c}`}>
              <div className="text-6xl font-bold">{String(n).padStart(2, '0')}</div>
              <div className="mt-3 text-sm font-semibold opacity-80">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-6">
        <h2 className="text-5xl font-bold tracking-tight md:text-6xl">Recent work</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.slice(0, 4).map((p, i) => (
            <article key={p.slug} className={`group overflow-hidden rounded-[2rem] bg-white ${i % 3 === 0 ? 'md:col-span-2' : ''}`}>
              <div className={`overflow-hidden ${i % 3 === 0 ? 'aspect-[2.4/1]' : 'aspect-[4/3]'}`}>
                <img src={asset(p.hero || p.thumb)} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#D81F2A]">{p.disciplines[0]}</p>
                  <h3 className="mt-1.5 text-2xl font-semibold">{p.name}</h3>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#161616] text-white">→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto my-24 max-w-7xl px-6">
        <div className="rounded-[2.5rem] bg-[#D81F2A] px-10 py-16 text-center text-white">
          <h2 className="mx-auto max-w-3xl text-5xl font-bold">Have a development to engineer?</h2>
          <span className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-bold text-[#D81F2A]">Start a conversation</span>
        </div>
      </section>

      <footer className="py-10">
        <div className="mx-auto max-w-7xl px-6 text-sm font-medium text-[#161616]/50">© {new Date().getFullYear()} DMF Engineering · Dubai, UAE</div>
      </footer>
      <RedesignBar current="B" />
    </div>
  );
}
