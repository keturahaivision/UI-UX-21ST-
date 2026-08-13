'use client';
import { useState, useCallback, useMemo } from 'react';
import Chapter from '@/components/chapters/Chapter';
import ConceptBar from './ConceptBar';
import data from '@/data/content.json';

// Stylised network field — the city as a living system of DMF's real projects.
// (The full build replaces this with Mapbox GL + verified GeoJSON coordinates.)
const CLUSTERS = {
  UAE: { cx: 0.34, cy: 0.42 }, 'Saudi Arabia': { cx: 0.66, cy: 0.30 },
  Bahrain: { cx: 0.58, cy: 0.58 }, Qatar: { cx: 0.5, cy: 0.5 }, Afghanistan: { cx: 0.8, cy: 0.66 },
  Unknown: { cx: 0.2, cy: 0.75 },
};
// deterministic scatter around a cluster centre
function pos(i, country) {
  const c = CLUSTERS[country] || CLUSTERS.Unknown;
  const a = (i * 2.399963) % (Math.PI * 2); // golden-angle spread, stable
  const r = 0.05 + ((i * 37) % 100) / 100 * 0.11;
  return { x: c.cx + Math.cos(a) * r, y: c.cy + Math.sin(a) * r * 0.8 };
}

export default function ConceptB() {
  const [p, setP] = useState(0);
  const [active, setActive] = useState(null);
  const onProgress = useCallback((v) => setP(v), []);
  const nodes = useMemo(() => data.projects.map((pr, i) => ({ ...pr, ...pos(i, pr.country || 'Unknown') })), []);
  // draw connections progressively within a country cluster
  const edges = useMemo(() => {
    const byC = {};
    nodes.forEach((n) => { (byC[n.country || 'Unknown'] ||= []).push(n); });
    const e = [];
    Object.values(byC).forEach((list) => list.forEach((n, i) => { if (i > 0) e.push([list[i - 1], n]); }));
    return e;
  }, [nodes]);
  const shownEdges = Math.round(p * edges.length);

  return (
    <div className="bg-paper-50 text-ink-900">
      <ConceptBar id="B" name="The City System" tone="light" />

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-paper-50">
        <div className="absolute inset-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            {[...Array(11)].map((_, i) => <line key={'v' + i} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#1E5AA8" strokeWidth="0.05" opacity="0.18" />)}
            {[...Array(11)].map((_, i) => <line key={'h' + i} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1E5AA8" strokeWidth="0.05" opacity="0.18" />)}
            {nodes.map((n, i) => <circle key={i} cx={n.x * 100} cy={n.y * 100} r="0.35" fill="#1E5AA8" opacity="0.5" />)}
          </svg>
        </div>
        <div className="u-container relative z-10">
          <div className="mb-8 font-mono text-label-sm" style={{ color: '#1E5AA8' }}>02 / POSITIONING · THE NETWORK VIEW</div>
          <h1 className="max-w-4xl font-display text-display-1 leading-[0.9] tracking-tightest text-ink-900">The city<br />as a system.</h1>
          <p className="mt-8 max-w-xl font-body text-body-lg text-slate-700">Every development is a node in a wider network of movement, utilities and infrastructure. DMF engineers the connections — {data.stats.total_projects} projects across {data.stats.countries_served} countries.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#network" className="rounded-sm px-7 py-4 font-mono text-label uppercase text-paper-50 transition-transform hover:-translate-y-0.5" style={{ background: '#1E5AA8' }}>Explore the network</a>
            <a href="#network" className="rounded-sm border border-slate-400 px-7 py-4 font-mono text-label uppercase text-ink-900 transition-colors hover:border-ink-900">Start a conversation</a>
          </div>
        </div>
      </section>

      {/* NETWORK — nodes connect on scroll */}
      <Chapter id="network" index={3} label="The Network" tone="light" pin scrub={2} onProgress={onProgress}>
        <div className="relative min-h-screen">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            {edges.slice(0, shownEdges).map(([a, b], i) => (
              <line key={i} x1={a.x * 100} y1={a.y * 100} x2={b.x * 100} y2={b.y * 100} stroke="#1E5AA8" strokeWidth="0.12" opacity="0.35" />
            ))}
            {nodes.map((n, i) => (
              <g key={i} onMouseEnter={() => setActive(n)} className="cursor-pointer">
                <circle cx={n.x * 100} cy={n.y * 100} r={active?.slug === n.slug ? 0.9 : 0.5} fill="#1E5AA8"
                  opacity={i < shownEdges + 3 ? 0.9 : 0.25} className="transition-all" />
              </g>
            ))}
          </svg>
          <div className="u-container relative z-10 flex min-h-screen flex-col justify-center">
            <p className="font-mono text-label-sm" style={{ color: '#1E5AA8' }}>{shownEdges} / {edges.length} CONNECTIONS PLOTTED</p>
            <h2 className="mt-5 max-w-2xl font-display text-h2 text-ink-900">One network,<br />engineered node by node.</h2>
            <div className="mt-8 h-24">
              {active && (
                <div className="max-w-sm rounded-xs border border-slate-300 bg-paper-50/90 p-4 backdrop-blur">
                  <p className="font-display text-title text-ink-900">{active.name}</p>
                  <p className="mt-1 font-mono text-label-sm text-slate-600">{active.location || '—'} · {active.disciplines[0]}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {data.filters.countries.map((c) => (
                <span key={c.label} className="rounded-sm border border-slate-400 px-3 py-1.5 font-mono text-label-sm text-slate-700">{c.label} <span style={{ color: '#1E5AA8' }}>{c.count}</span></span>
              ))}
            </div>
          </div>
        </div>
      </Chapter>
    </div>
  );
}
