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
    <section className="u-container pb-24">
      <div className="flex items-baseline justify-between">
        <p className="u-label text-stone-500">Regional footprint</p>
        <p className="font-mono text-label-sm text-stone-600">INDICATIVE · MAPBOX MAP PENDING COORDINATES</p>
      </div>
      <div className="relative mt-6 overflow-hidden rounded-sm glass" style={{ aspectRatio: '5 / 2' }}>
        <svg viewBox="0 0 100 40" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          {[...Array(11)].map((_, i) => <line key={'v' + i} x1={i * 10} y1="0" x2={i * 10} y2="40" stroke="#D81F2A" strokeWidth="0.04" opacity="0.14" />)}
          {[...Array(5)].map((_, i) => <line key={'h' + i} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#D81F2A" strokeWidth="0.04" opacity="0.14" />)}
          {countries.map((c) => {
            const p = POS[c.label]; const on = active === c.label;
            const r = 1.4 + Math.sqrt(c.count) * 0.9;
            return (
              <g key={c.label} onMouseEnter={() => setActive(c.label)} onMouseLeave={() => setActive(null)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={r + 1.5} fill="#D81F2A" opacity={on ? 0.18 : 0.08} />
                <circle cx={p.x} cy={p.y} r={r} fill="#D81F2A" opacity={on ? 1 : 0.7} />
                <text x={p.x} y={p.y - r - 1} textAnchor="middle" className="font-mono" fontSize="1.6" fill="#F6F4F1">{c.label} · {c.count}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {countries.map((c) => (
          <Link key={c.label} href={`/projects?c=${encodeURIComponent(c.label)}`}
            className="glass rounded-sm px-3 py-1.5 font-mono text-label-sm text-paper-50/80 transition-colors hover:text-accent">
            {c.label} <span className="text-accent">{String(c.count).padStart(2, '0')}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
