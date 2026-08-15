import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/ui/Gallery';
import { pageMeta, projectJsonLd } from '@/lib/seo';
import data from '@/data/content.json';
import { asset } from '@/lib/asset';

export function generateStaticParams() {
  return data.projects.map((p) => ({ slug: p.slug }));
}
export function generateMetadata({ params }) {
  const p = data.projects.find((x) => x.slug === params.slug);
  if (!p) return pageMeta({ title: 'Project' });
  const desc = p.description || `${p.disciplineDisplay} by DMF Engineering${p.location ? ' in ' + p.location : ''}${p.client ? ' for ' + p.client : ''}.`;
  return pageMeta({ title: p.name, description: desc.slice(0, 180), path: `/projects/${p.slug}` });
}

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <div className="border-t border-white/10 py-4">
      <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/45">{label}</dt>
      <dd className="mt-2 text-[15px] text-white">{value}</dd>
    </div>
  );
}

export default function ProjectDetail({ params }) {
  const idx = data.projects.findIndex((p) => p.slug === params.slug);
  if (idx < 0) return notFound();
  const p = data.projects[idx];
  const prev = data.projects[(idx - 1 + data.projects.length) % data.projects.length];
  const next = data.projects[(idx + 1) % data.projects.length];
  const gallery = p.gallery.filter((g) => g.src !== p.hero);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(p)) }} />
      {/* hero */}
      <section className="relative h-[68vh] min-h-[480px] w-full overflow-hidden">
        {p.hero && <img src={asset(p.hero)} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 u-scrim-dark" />
        <div className="u-container relative z-10 flex h-full flex-col justify-end pb-14">
          <Link href="/projects" className="mb-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/80 u-link-underline">← All projects</Link>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white">{p.disciplineDisplay}</p>
          <h1 className="mt-4 max-w-4xl font-raleway text-4xl font-medium text-white md:text-6xl">{p.name}</h1>
        </div>
      </section>

      <section className="u-container grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {p.scope && <p className="r-eyebrow">{p.scope}</p>}
          {p.description ? (
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-white/70">{p.description}</p>
          ) : (
            <p className="mt-6 max-w-prose text-[15px] text-white/45">
              {p.disciplineDisplay} delivered by DMF Engineering{p.location ? ` in ${p.location}` : ''}. <span className="text-white/45">[Detailed write-up pending]</span>
            </p>
          )}
        </div>
        <dl className="h-fit rounded-[1.25rem] tile p-6">
          <Fact label="Discipline" value={p.disciplineDisplay} />
          <Fact label="Client" value={p.client} />
          <Fact label="Location" value={p.location} />
          <Fact label="Size" value={p.size} />
          <Fact label="Completion" value={p.completion} />
        </dl>
      </section>

      {gallery.length > 0 && (
        <section className="u-container pb-24">
          <p className="r-eyebrow mb-6">Gallery</p>
          <Gallery images={gallery} />
        </section>
      )}

      <nav className="border-t border-white/10">
        <div className="u-container grid grid-cols-2">
          <Link href={`/projects/${prev.slug}`} className="group border-r border-white/10 py-10 pr-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/45">← Previous</span>
            <p className="mt-2 font-raleway text-xl font-medium text-white group-hover:text-brand-red">{prev.name}</p>
          </Link>
          <Link href={`/projects/${next.slug}`} className="group py-10 pl-4 text-right">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/45">Next →</span>
            <p className="mt-2 font-raleway text-xl font-medium text-white group-hover:text-brand-red">{next.name}</p>
          </Link>
        </div>
      </nav>
    </article>
  );
}
