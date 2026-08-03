'use client';
import Chapter from './Chapter';
import Reveal from '@/components/motion/Reveal';
import StatCounter from '@/components/ui/StatCounter';
import data from '@/data/content.json';

export default function ChapterScale() {
  const s = data.stats;
  const disciplines = Object.keys(s.disciplines).length;
  return (
    <Chapter id="scale" index={4} label="Scale" tone="dark">
      <div className="u-container flex min-h-screen flex-col justify-center py-32">
        <Reveal as="h2" className="max-w-3xl font-display text-h1 text-paper-50">
          Three decades of work, measured.
        </Reveal>
        <div className="mt-20 grid gap-12 sm:grid-cols-3">
          <StatCounter value={s.total_projects} label="Projects delivered" />
          <StatCounter value={s.countries_served} label="Countries served" />
          <StatCounter value={disciplines} label="Engineering disciplines" />
        </div>
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-700 pt-8">
          {Object.entries(s.disciplines).map(([k, v]) => (
            <span key={k} className="font-mono text-label-sm text-stone-400">
              {k} <span className="text-accent">{String(v).padStart(2, '0')}</span>
            </span>
          ))}
        </div>
      </div>
    </Chapter>
  );
}
