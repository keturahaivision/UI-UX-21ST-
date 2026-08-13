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
  return (
    <>
      <PageHeader label="Who we are" title="Building a brighter future, together" />
      <section className="u-container pb-16">
        <p className="max-w-3xl font-body text-body-lg leading-relaxed text-stone-200">
          DMF Engineering, founded by visionary David Ghosheh, has earned a strong reputation for delivering
          innovative and sustainable engineering solutions in the UAE, the Gulf region, and worldwide. Under David&apos;s
          leadership, the company has become synonymous with excellence — blending creativity, technical expertise and
          integrity. Our approach emphasises close collaboration with clients to deliver high-quality, cost-effective
          projects on time and within budget, and it is this dedication that leads clients to return to DMF for their
          subsequent projects.
        </p>
      </section>
      <section className="u-container grid gap-px overflow-hidden rounded-xs bg-slate-700 pb-0 md:grid-cols-3">
        {VALUES.map(([k, v]) => (
          <div key={k} className="bg-ink-900 p-8">
            <h2 className="u-label text-accent-soft">{k}</h2>
            <p className="mt-4 font-body text-body text-stone-300">{v}</p>
          </div>
        ))}
      </section>

      {/* clients */}
      <section className="u-container py-24">
        <p className="u-label text-stone-500">Trusted by</p>
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xs bg-slate-700 sm:grid-cols-3 lg:grid-cols-5">
          {data.clients.filter((c) => c.logo).map((c) => (
            <div key={c.logo} className="flex items-center justify-center bg-ink-900 p-6">
              <img src={asset(c.logo)} alt={c.name || 'DMF Engineering client'} loading="lazy" className="max-h-12 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
