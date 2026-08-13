'use client';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectCard from './ProjectCard';
import data from '@/data/content.json';

export default function ProjectGrid() {
  const params = useSearchParams();
  const initialD = params.get('d');
  const validD = data.filters.disciplines.some((f) => f.label === initialD) ? initialD : 'All';
  const [discipline, setDiscipline] = useState(validD);
  const [country, setCountry] = useState('All');

  const filtered = useMemo(() => data.projects.filter((p) => {
    const dOk = discipline === 'All' || p.disciplines.includes(discipline);
    const cOk = country === 'All' || p.country === country;
    return dOk && cOk;
  }), [discipline, country]);

  const Pill = ({ active, onClick, children, count }) => (
    <button onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 font-mono text-label-sm uppercase transition-colors duration-300 ${active ? 'border-accent bg-accent text-paper-50' : 'border-slate-600 text-stone-300 hover:border-stone-400'}`}>
      {children}{typeof count === 'number' && <span className="ml-1.5 opacity-60">{count}</span>}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-slate-700 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 u-label text-stone-500">Discipline</span>
          <Pill active={discipline === 'All'} onClick={() => setDiscipline('All')} count={data.projects.length}>All</Pill>
          {data.filters.disciplines.map((f) => (
            <Pill key={f.label} active={discipline === f.label} onClick={() => setDiscipline(f.label)} count={f.count}>{f.label}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 u-label text-stone-500">Country</span>
          <Pill active={country === 'All'} onClick={() => setCountry('All')}>All</Pill>
          {data.filters.countries.map((f) => (
            <Pill key={f.label} active={country === f.label} onClick={() => setCountry(f.label)} count={f.count}>{f.label}</Pill>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-label-sm text-stone-500">{filtered.length} projects</p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => <ProjectCard key={p.slug} project={p} wide />)}
      </div>
      {filtered.length === 0 && <p className="mt-16 text-center font-body text-stone-400">No projects match this combination.</p>}
    </div>
  );
}
