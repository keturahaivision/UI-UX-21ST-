import PageHeader from '@/components/ui/PageHeader';
import { pageMeta } from '@/lib/seo';
import data from '@/data/content.json';

export const metadata = pageMeta({
  title: 'Services', path: '/services',
  description: 'Master planning, roads & infrastructure, architecture, structural, civil, landscape, traffic, construction supervision, cost and project management — DMF Engineering\'s full multidisciplinary offer.',
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader label="What we do" title="Services"
        intro="A multidisciplinary practice — from the first master plan to construction on site." />
      <section className="u-container pb-32">
        <div className="grid gap-px overflow-hidden rounded-xs bg-slate-700 md:grid-cols-2">
          {data.services.map((s, i) => (
            <div key={s.slug} className="bg-ink-900 p-8 md:p-10">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-label-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display text-h3 text-paper-50">{s.name}</h2>
              </div>
              <p className="mt-4 font-body text-body leading-relaxed text-stone-300">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
