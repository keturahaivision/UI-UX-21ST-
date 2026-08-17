'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import data from '@/data/content.json';

// Interactive regional footprint. Real projects aggregated by location, plotted
// on an oriented Gulf diagram: hover a node for its projects, click to explore.
const NODES = {
  'Dubai':                 { x: 60, y: 46, country: 'UAE' },
  'Sharjah':               { x: 63, y: 42, country: 'UAE' },
  'Abu Dhabi':             { x: 53, y: 51, country: 'UAE' },
  'Al Marjan Island (RAK)':{ x: 66, y: 37, country: 'UAE', label: 'Ras Al Khaimah' },
  'Doha':                  { x: 45, y: 41, country: 'Qatar' },
  'Jeddah':                { x: 11, y: 44, country: 'Saudi Arabia' },
  'Al Madina':             { x: 14, y: 33, country: 'Saudi Arabia', label: 'Al Madinah' },
  'Kabul':                 { x: 88, y: 11, country: 'Afghanistan' },
};
const HUB = 'Dubai';

export default function InteractiveMap() {
  const router = useRouter();
  const [active, setActive] = useState(null);

  const nodes = useMemo(() => {
    const agg = {};
    for (const p of data.projects) {
      const city = (p.location || '').split(',')[0].trim();
      if (!NODES[city]) continue;
      (agg[city] ||= { city, count: 0, names: [], ...NODES[city] });
      agg[city].count++;
      if (agg[city].names.length < 4) agg[city].names.push(p.name);
    }
    return Object.values(agg).sort((a, b) => b.count - a.count);
  }, []);
  const hub = nodes.find((n) => n.city === HUB) || nodes[0];
  const max = Math.max(...nodes.map((n) => n.count));
  const a = active ? nodes.find((n) => n.city === active) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-coal">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative" style={{ aspectRatio: '16 / 9' }}>
        <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          {/* connective infrastructure lines from the Dubai hub */}
          {hub && nodes.filter((n) => n.city !== hub.city).map((n) => (
            <line key={'l' + n.city} x1={hub.x} y1={hub.y} x2={n.x} y2={n.y}
              stroke="#D42A2A" strokeWidth="0.14"
              strokeDasharray="0.8 0.8" opacity={active && active !== n.city && active !== hub.city ? 0.12 : 0.4} />
          ))}
          {nodes.map((n) => {
            const r = 1.3 + (n.count / max) * 3.4;
            const on = active === n.city;
            return (
              <g key={n.city} className="cursor-pointer"
                onMouseEnter={() => setActive(n.city)} onMouseLeave={() => setActive(null)}
                onClick={() => router.push(`/projects?c=${encodeURIComponent(n.country)}`)}>
                <circle cx={n.x} cy={n.y} r={r + 2.4} fill="#D42A2A" opacity={on ? 0.22 : 0.1}>
                  <animate attributeName="r" values={`${r + 1.6};${r + 3};${r + 1.6}`} dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={n.x} cy={n.y} r={r} fill="#D42A2A" opacity={on ? 1 : 0.85} stroke="#fff" strokeWidth={on ? 0.2 : 0} />
                <text x={n.x} y={n.y - r - 1.4} textAnchor="middle" fontSize="1.7"
                  className="font-raleway" fontWeight="700" fill="#fff" opacity={on ? 1 : 0.75}>
                  {(n.label || n.city)} · {n.count}
                </text>
              </g>
            );
          })}
        </svg>

        {/* hover tooltip */}
        {a && (
          <div className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full"
            style={{ left: `${a.x}%`, top: `${(a.y / 60) * 100 - 4}%` }}>
            <div className="tile rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between">
                <p className="font-raleway text-sm font-bold text-white">{a.label || a.city}</p>
                <p className="font-raleway text-[11px] font-semibold text-brand-red">{String(a.count).padStart(2, '0')} projects</p>
              </div>
              <p className="mt-0.5 font-ptsans text-[11px] text-white/50">{a.country}</p>
              <ul className="mt-2 space-y-0.5">
                {a.names.slice(0, 3).map((nm) => <li key={nm} className="truncate font-ptsans text-[11px] text-white/70">— {nm}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* accessible / mobile fallback list */}
      <div className="flex flex-wrap gap-2 border-t border-white/10 p-5">
        {nodes.map((n) => (
          <Link key={n.city} href={`/projects?c=${encodeURIComponent(n.country)}`}
            onMouseEnter={() => setActive(n.city)} onMouseLeave={() => setActive(null)}
            className="rounded-full border border-white/12 px-3.5 py-1.5 font-raleway text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70 transition-colors hover:border-brand-red hover:text-white">
            {n.label || n.city} <span className="text-brand-red">{String(n.count).padStart(2, '0')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
