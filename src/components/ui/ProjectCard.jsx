'use client';
import Link from 'next/link';

export default function ProjectCard({ project, className = '', wide = false }) {
  const p = project;
  return (
    <Link href={`/projects/${p.slug}`}
      className={`group relative block overflow-hidden rounded-xs bg-ink-800 ${className}`}>
      <div className={`relative ${wide ? 'aspect-[4/3]' : 'aspect-[3/4]'} w-full overflow-hidden`}>
        {p.thumb ? (
          <img src={p.thumb} alt={p.name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-settle group-hover:scale-105" />
        ) : <div className="h-full w-full bg-slate-700" />}
        <div className="absolute inset-0 u-scrim-dark opacity-90" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="u-label truncate text-accent">{p.disciplines[0] || 'Project'}</p>
        <h3 className="mt-2 font-display text-title leading-tight text-paper-50">{p.name}</h3>
        {p.location && <p className="mt-1 font-mono text-label-sm text-paper-50/60">{p.location}</p>}
      </div>
    </Link>
  );
}
