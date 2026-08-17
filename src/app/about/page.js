import PageHeader from '@/components/ui/PageHeader';
import { pageMeta } from '@/lib/seo';
import data from '@/data/content.json';
import { asset } from '@/lib/asset';

export const metadata = pageMeta({
  title: 'About', path: '/about',
  description: 'DMF Engineering, founded by David Ghosheh, delivers innovative and sustainable engineering across the UAE, Gulf and worldwide — built on expertise, integrity and close client collaboration.',
});

const VALUES = [
  ['Mission', 'To provide exceptional architectural and engineering services in Dubai and beyond — exceeding client expectations through innovative, sustainable and cost-effective solutions delivered on time and within budget.'],
  ['Vision', 'To be the premier multidisciplinary firm in Dubai, setting standards for quality, creativity and engineering excellence.'],
  ['Values', 'Technical expertise, ingenuity and innovation — ingrained as corporate values and applied through close collaboration with clients and teams.'],
];

export default function AboutPage() {
  const s = data.stats;
  return (
    <>
      <PageHeader label="Who we are" title="Building a brighter future, together" />

      <section className="u-container pb-16">
        <p className="max-w-3xl text-xl leading-relaxed text-white/70">
          DMF Engineering, founded by visionary David Ghosheh, has earned a strong reputation for delivering
          innovative and sustainable engineering solutions in the UAE, the Gulf region, and worldwide. Under David&apos;s
          leadership, the company has become synonymous with excellence — blending creativity, technical expertise and
          integrity. Our approach emphasises close collaboration with clients to deliver high-quality, cost-effective
          projects on time and within budget, and it is this dedication that leads clients to return to DMF for their
          subsequent projects.
        </p>
      </section>

      {/* Stats rule */}
      <section className="u-container">
        <div className="grid grid-cols-3 gap-6 border-y border-white/10 py-10">
          {[[s.total_projects, 'Projects delivered'], [s.countries_served, 'Countries served'], [s.disciplines_count, 'Disciplines']].map(([n, l]) => (
            <div key={l}>
              <div className="font-raleway text-5xl font-medium md:text-6xl">{String(n).padStart(2, '0')}</div>
              <div className="mt-2 text-sm font-medium text-white/45">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="u-container py-20">
        <div className="grid gap-px overflow-hidden rounded-[1.25rem] bg-white/10 md:grid-cols-3">
          {VALUES.map(([k, v]) => (
            <div key={k} className="bg-brand-coal p-8">
              <h2 className="r-eyebrow">{k}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clients */}
      {data.clients?.some((c) => c.logo) && (
        <section className="u-container pb-28">
          <p className="r-eyebrow">Trusted by</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.clients.filter((c) => c.logo).map((c) => (
              <div key={c.logo} className="flex items-center justify-center rounded-xl bg-white/90 p-6">
                <img src={asset(c.logo)} alt={c.name || 'DMF Engineering client'} loading="lazy"
                  className="max-h-11 w-auto opacity-80 transition hover:opacity-100" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
