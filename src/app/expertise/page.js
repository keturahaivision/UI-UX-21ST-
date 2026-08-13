import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { pageMeta } from '@/lib/seo';
import data from '@/data/content.json';

export const metadata = pageMeta({
  title: 'Expertise', path: '/expertise',
  description: 'Master planning, roads & infrastructure, traffic & mobility, civil, structural, architecture, landscape, project & cost management and construction supervision — DMF’s disciplines, connected to the projects they built.',
});

// service slug -> the discipline tag used on project records (for related-project counts)
const DISCIPLINE = {
  'master-planning': 'Master Plan', architecture: 'Architectural',
  'road-and-infrastructure-design': 'Roads & Infrastructure', 'civil-engineering': 'Roads & Infrastructure',
  'structural-engineering': 'Structural', landscape: 'Landscape', 'traffic-engineering': 'Traffic',
  'construction-supervison': 'Supervision',
};
const HOW_WE_WORK = ['Understand', 'Plan', 'Coordinate', 'Engineer', 'Approve', 'Deliver', 'Optimise'];

export default function ExpertisePage() {
  const services = data.services.map((s) => {
    const label = DISCIPLINE[s.slug];
    const related = label ? data.projects.filter((p) => p.disciplines.includes(label)) : [];
    return { ...s, label, related };
  });

  return (
    <>
      <PageHeader label="What we do" title="Master planning meets infrastructure"
        intro="Ten disciplines, one coordinated practice — from the first land-use line to construction on site. Each connects to the projects that prove it." />

      {/* How we work */}
      <section className="u-container pb-16">
        <p className="u-label text-stone-500">How we work</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3">
          {HOW_WE_WORK.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="glass rounded-sm px-4 py-2 font-mono text-label-sm uppercase text-paper-50">{String(i + 1).padStart(2, '0')} {step}</span>
              {i < HOW_WE_WORK.length - 1 && <span className="text-accent-soft">→</span>}
            </span>
          ))}
        </div>
      </section>

      {/* Disciplines */}
      <section className="u-container pb-32">
        <div className="grid gap-px overflow-hidden rounded-sm bg-slate-700 md:grid-cols-2">
          {services.map((s, i) => (
            <div key={s.slug} className="bg-ink-900 p-8 md:p-10">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-label-sm text-accent-soft">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="font-display text-h3 text-paper-50">{s.name}</h2>
                </div>
                {s.related.length > 0 && (
                  <span className="shrink-0 font-mono text-label-sm text-stone-500">{String(s.related.length).padStart(2, '0')} projects</span>
                )}
              </div>
              <p className="mt-4 font-body text-body leading-relaxed text-stone-300">{s.description}</p>
              {s.related.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {s.related.slice(0, 4).map((p) => (
                    <Link key={p.slug} href={`/projects/${p.slug}`} className="glass rounded-sm px-3 py-1.5 font-mono text-label-sm text-paper-50/80 transition-colors hover:text-accent-soft">{p.name}</Link>
                  ))}
                  {s.related.length > 4 && (
                    <Link href={`/projects?d=${encodeURIComponent(s.label)}`} className="rounded-sm px-3 py-1.5 font-mono text-label-sm text-accent-soft u-link-underline">+{s.related.length - 4} more →</Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
