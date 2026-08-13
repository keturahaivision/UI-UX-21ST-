import Link from 'next/link';

export const metadata = { title: 'Concept Prototypes · DMF', robots: { index: false } };

const CONCEPTS = [
  { id: 'A', name: 'Engineering the Roots', href: '/concepts/engineering-the-roots', tone: 'dark',
    line: 'Cinematic, technical, dark graphite. CAD linework; the infrastructure strata beneath a development assemble on scroll ("Beneath the City").',
    best: 'Boldest, most ownable — makes the "systems beneath" positioning literal. Research favourite.' },
  { id: 'B', name: 'The City System', href: '/concepts/city-system', tone: 'light',
    line: 'GIS-driven, lighter palette, engineered blue. The city as a living network; projects are nodes that connect on scroll (full build = Mapbox).',
    best: 'Data-forward and distinctive; leans on the map as the hero. Needs a Mapbox token.' },
  { id: 'C', name: 'From Plan to Place', href: '/concepts/plan-to-place', tone: 'light',
    line: 'Editorial and sequential. Master-plan drawings dissolve into built photography; each project a challenge → approach → outcome story.',
    best: 'Warmest and most content-driven; closest to the storytelling site already prototyped.' },
];

export default function ConceptsIndex() {
  return (
    <div className="min-h-screen bg-ink-900 text-paper-50">
      <div className="u-container py-28">
        <p className="u-label text-accent">Phase 04 · Decision gate</p>
        <h1 className="mt-5 max-w-3xl font-display text-display-3">Three directions for DMF. Pick one.</h1>
        <p className="mt-6 max-w-2xl font-body text-body-lg text-stone-300">
          Each is a live coded prototype — a hero plus one signature scroll section — in the same design system, so the choice is about direction, not polish. All share the verified DMF content and the "Engineering the roots of development" positioning.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CONCEPTS.map((c) => (
            <Link key={c.id} href={c.href} className="group flex flex-col rounded-sm border border-slate-700 bg-ink-800 p-8 transition-colors hover:border-accent">
              <span className="font-mono text-display-3 text-accent">{c.id}</span>
              <h2 className="mt-4 font-display text-title">{c.name}</h2>
              <p className="mt-4 font-body text-caption text-stone-300">{c.line}</p>
              <p className="mt-6 border-t border-slate-700 pt-4 font-mono text-label-sm text-stone-400">{c.best}</p>
              <span className="mt-6 u-label u-link-underline text-paper-50">View prototype →</span>
            </Link>
          ))}
        </div>

        <p className="mt-16 max-w-2xl font-mono text-label-sm text-stone-500">
          RECOMMENDATION: Concept A. Both research streams point to the same open ground — no GCC competitor owns infrastructure + design craft, and the "roots" layer as literal hero is the most distinctive, most defensible position.
        </p>
      </div>
    </div>
  );
}
