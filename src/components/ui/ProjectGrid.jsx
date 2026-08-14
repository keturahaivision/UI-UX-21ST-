'use client';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectCard from './ProjectCard';
import data from '@/data/content.json';

export default function ProjectGrid() {
  const params = useSearchParams();
  const initialD = params.get('d');
  const validD = data.filters.disciplines.some((f) => f.label === initialD) ? initialD : 'All';
  const initialC = params.get('c');
  const validC = data.filters.countries.some((f) => f.label === initialC) ? initialC : 'All';
  const [discipline, setDiscipline] = useState(validD);
  const [country, setCountry] = useState(validC);

  const filtered = useMemo(() => data.projects.filter((p) => {
    const dOk = discipline === 'All' || p.disciplines.includes(discipline);
    const cOk = country === 'All' || p.country === country;
    return dOk && cOk;
  }), [discipline, country]);

  const Pill = ({ active, onClick, children, count }) => (
    <button onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 ${active ? 'border-dmf-red bg-dmf-red text-white' : 'border-black/10 bg-white text-dmf-ink/70 hover:border-dmf-ink/30'}`}>
      {children}{typeof count === 'number' && <span className="ml-1.5 opacity-60">{count}</span>}
    </button>
  );

  const Label = ({ children }) => (
    <span className="mr-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-dmf-ink/40">{children}</span>
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-black/10 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Label>Discipline</Label>
          <Pill active={discipline === 'All'} onClick={() => setDiscipline('All')} count={data.projects.length}>All</Pill>
          {data.filters.disciplines.map((f) => (
            <Pill key={f.label} active={discipline === f.label} onClick={() => setDiscipline(f.label)} count={f.count}>{f.label}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label>Country</Label>
          <Pill active={country === 'All'} onClick={() => setCountry('All')}>All</Pill>
          {data.filters.countries.map((f) => (
            <Pill key={f.label} active={country === f.label} onClick={() => setCountry(f.label)} count={f.count}>{f.label}</Pill>
          ))}
        </div>
      </div>

      <h2 className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dmf-ink/40" aria-live="polite">{filtered.length} projects</h2>
      <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => <ProjectCard key={p.slug} project={p} wide />)}
      </div>
      {filtered.length === 0 && <p className="mt-16 text-center text-dmf-ink/50">No projects match this combination.</p>}
    </div>
  );
}
