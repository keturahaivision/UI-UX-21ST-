import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/ui/Gallery';
import { pageMeta, projectJsonLd } from '@/lib/seo';
import data from '@/data/content.json';

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
    <div className="border-t border-slate-700 py-4">
      <dt className="u-label text-stone-500">{label}</dt>
      <dd className="mt-2 font-body text-body text-paper-50">{value}</dd>
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
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
        {p.hero && <img src={p.hero} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 u-scrim-dark" />
        <div className="u-container relative z-10 flex h-full flex-col justify-end pb-14">
          <Link href="/projects" className="u-label u-link-underline mb-6 text-paper-50/70">← All projects</Link>
          <p className="u-label text-accent">{p.disciplineDisplay}</p>
          <h1 className="mt-4 max-w-4xl font-display text-display-3 text-paper-50">{p.name}</h1>
        </div>
      </section>

      <section className="u-container grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {p.scope && <p className="u-label text-accent">{p.scope}</p>}
          {p.description ? (
            <p className="mt-6 max-w-prose font-body text-body-lg leading-relaxed text-stone-200">{p.description}</p>
          ) : (
            <p className="mt-6 max-w-prose font-body text-body text-stone-400">
              {p.disciplineDisplay} delivered by DMF Engineering{p.location ? ` in ${p.location}` : ''}. <span className="text-stone-500">[Detailed write-up pending]</span>
            </p>
          )}
        </div>
        <dl className="lg:pt-1">
          <Fact label="Discipline" value={p.disciplineDisplay} />
          <Fact label="Client" value={p.client} />
          <Fact label="Location" value={p.location} />
          <Fact label="Size" value={p.size} />
          <Fact label="Completion" value={p.completion} />
        </dl>
      </section>

      {gallery.length > 0 && (
        <section className="u-container pb-24">
          <p className="u-label mb-6 text-stone-500">Gallery</p>
          <Gallery images={gallery} />
        </section>
      )}

      <nav className="border-t border-slate-700">
        <div className="u-container grid grid-cols-2">
          <Link href={`/projects/${prev.slug}`} className="group border-r border-slate-700 py-10 pr-4">
            <span className="u-label text-stone-500">← Previous</span>
            <p className="mt-2 font-display text-title text-paper-50 group-hover:text-accent">{prev.name}</p>
          </Link>
          <Link href={`/projects/${next.slug}`} className="group py-10 pl-4 text-right">
            <span className="u-label text-stone-500">Next →</span>
            <p className="mt-2 font-display text-title text-paper-50 group-hover:text-accent">{next.name}</p>
          </Link>
        </div>
      </nav>
    </article>
  );
}
