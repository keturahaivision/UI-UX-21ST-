'use client';
import { useState, useCallback } from 'react';
import Chapter from '@/components/chapters/Chapter';

const LAYERS = [
  { key: 'MASTER PLAN', depth: '±0.00', d: 'M0 40 H1200', note: 'land use · movement · public realm' },
  { key: 'ROADS', depth: '-0.15', d: 'M0 40 C 300 10, 900 70, 1200 30', note: 'geometry · chainage · pavement' },
  { key: 'TRAFFIC', depth: '-0.20', d: 'M0 55 H1200 M0 25 H1200', note: 'capacity · junctions · signals' },
  { key: 'DRAINAGE', depth: '-1.20', d: 'M0 20 L200 60 L400 20 L600 60 L800 20 L1000 60 L1200 20', note: 'storm · foul · attenuation' },
  { key: 'WATER', depth: '-1.80', d: 'M0 40 H1200', note: 'potable · irrigation · fire' },
  { key: 'POWER', depth: '-2.40', d: 'M0 30 H520 L560 55 L600 30 H1200', note: 'HV · LV · street lighting' },
  { key: 'LANDSCAPE', depth: '+0.30', d: 'M0 55 Q 300 15 600 45 T 1200 40', note: 'softscape · hardscape · grading' },
  { key: 'STRUCTURES', depth: '+0.00', d: 'M120 60 V15 H240 V60 M480 60 V20 H600 V60 M900 60 V25 H1020 V60', note: 'bridges · buildings · retaining' },
];

export default function Strata() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  const shown = Math.round(p * (LAYERS.length + 1));
  return (
    <Chapter id="systems-below" index={2} tone="dark" pin scrub={2.4} onProgress={onProgress}>
      <div className="relative flex min-h-screen items-start lg:items-center">
        <div className="u-container grid w-full gap-10 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="relative z-10">
            <p className="u-label text-accent-soft">The systems below</p>
            <h2 className="mt-5 font-display text-h2">A city is more<br />than what you see.</h2>
            <p className="mt-5 max-w-sm font-body text-body text-paper-50/70">Scroll to assemble the systems beneath a development — the layers that make the city above possible. <span className="text-stone-500">Conceptual schematic.</span></p>
            <p className="mt-8 font-mono text-label-sm text-stone-500">LAYER {String(Math.min(shown, LAYERS.length)).padStart(2, '0')} / {LAYERS.length}</p>
          </div>
          <div className="flex flex-col gap-2">
            {LAYERS.map((l, i) => {
              const on = i < shown;
              return (
                <div key={l.key} className="glass overflow-hidden rounded-xs transition-all duration-500 ease-settle"
                  style={{ opacity: on ? 1 : 0.12, transform: on ? 'translateX(0)' : 'translateX(24px)' }}>
                  <div className="flex items-center justify-between px-4 pt-3">
                    <span className="font-mono text-label-sm text-paper-50">{String(i + 1).padStart(2, '0')} · {l.key}</span>
                    <span className="font-mono text-label-sm text-accent-soft">{l.depth}m</span>
                  </div>
                  <svg viewBox="0 0 1200 70" className="h-9 w-full" preserveAspectRatio="none"><path d={l.d} fill="none" stroke={on ? '#D81F2A' : '#3A4048'} strokeWidth="2" /></svg>
                  <span className="block px-4 pb-3 font-mono text-label-sm uppercase text-stone-500">{l.note}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-10 hidden text-center font-display text-h3 transition-opacity duration-700 lg:block" style={{ opacity: p > 0.9 ? 1 : 0 }}>This is where DMF works.</div>
      </div>
    </Chapter>
  );
}
