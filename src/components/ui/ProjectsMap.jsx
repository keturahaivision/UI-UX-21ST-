'use client';
import { useState } from 'react';
import Link from 'next/link';
import data from '@/data/content.json';

// Regional footprint — indicative country clusters from verified project locations.
// The full interactive map (Mapbox GL + per-project GeoJSON) drops in once
// coordinates are confirmed; until then this plots by country only, honestly.
const POS = {
  UAE: { x: 30, y: 52 }, 'Saudi Arabia': { x: 16, y: 40 }, Qatar: { x: 40, y: 50 },
  Bahrain: { x: 34, y: 44 }, Afghanistan: { x: 74, y: 26 },
};

export default function ProjectsMap() {
  const [active, setActive] = useState(null);
  const countries = data.filters.countries.filter((c) => POS[c.label]);

  return (
    <section className="u-container pb-20">
      <div className="flex items-baseline justify-between">
        <p className="r-eyebrow">Regional footprint</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sys-faint">Indicative · by country</p>
      </div>
      <div className="relative mt-6 overflow-hidden rounded-[1.25rem] border border-sys-line bg-sys-panel2" style={{ aspectRatio: '5 / 2' }}>
        <svg viewBox="0 0 100 40" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          {[...Array(11)].map((_, i) => <line key={'v' + i} x1={i * 10} y1="0" x2={i * 10} y2="40" stroke="#1A1A1A" strokeWidth="0.04" opacity="0.10" />)}
          {[...Array(5)].map((_, i) => <line key={'h' + i} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1A1A1A" strokeWidth="0.04" opacity="0.10" />)}
          {countries.map((c) => {
            const p = POS[c.label]; const on = active === c.label;
            const r = 1.4 + Math.sqrt(c.count) * 0.9;
            return (
              <g key={c.label} onMouseEnter={() => setActive(c.label)} onMouseLeave={() => setActive(null)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={r + 1.5} fill="#C4202B" opacity={on ? 0.20 : 0.10} />
                <circle cx={p.x} cy={p.y} r={r} fill="#C4202B" opacity={on ? 1 : 0.8} />
                <text x={p.x} y={p.y - r - 1} textAnchor="middle" className="font-mono" fontSize="1.6" fill="#1A1A1A">{c.label} · {c.count}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {countries.map((c) => (
          <Link key={c.label} href={`/projects?c=${encodeURIComponent(c.label)}`}
            className="rounded-full tile px-3.5 py-1.5 text-xs font-medium text-sys-muted transition-colors hover:text-sys-red">
            {c.label} <span className="text-sys-red">{String(c.count).padStart(2, '0')}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
