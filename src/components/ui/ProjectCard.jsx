'use client';
import Link from 'next/link';
import { asset } from '@/lib/asset';

// Light Refined card — imagery-led, caption below the image.
export default function ProjectCard({ project, className = '', wide = false }) {
  const p = project;
  return (
    <Link href={`/projects/${p.slug}`} className={`group block ${className}`}>
      <div className={`relative ${wide ? 'aspect-[4/3]' : 'aspect-[3/4]'} w-full overflow-hidden rounded-[1rem] bg-white/[0.03]`}>
        {p.thumb ? (
          <img src={asset(p.thumb)} alt={p.name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-settle group-hover:scale-[1.04]" />
        ) : <div className="h-full w-full bg-black/5" />}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-sys-red">{p.disciplines[0] || 'Project'}</p>
      <h3 className="mt-1.5 font-display text-xl font-medium leading-tight text-sys-ink">{p.name}</h3>
      {p.location && <p className="mt-0.5 text-sm text-sys-faint">{p.location}</p>}
    </Link>
  );
}
