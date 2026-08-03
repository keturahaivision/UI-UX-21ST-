'use client';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Preload the Chapter 1-3 hero imagery; the counter reflects REAL load progress.
const CRITICAL = [
  '/images/2015_07_Wb_porto-island-Aerial-02.webp', // Ch1 Land
  '/images/2019_11_Wb_EURO-N-MP.webp',              // Ch2 line-draw source
  '/images/2015_07_Wb_NAH-Masterplan.webp',         // Ch3 plan
  '/images/2015_07_Wb_NAH-01.webp',                 // Ch3 built
];

export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let loaded = 0, cancelled = false;
    const total = CRITICAL.length;
    const done = () => {
      loaded += 1;
      if (!cancelled) setPct(Math.round((loaded / total) * 100));
      if (loaded >= total && !cancelled) {
        setTimeout(() => setGone(true), reduced ? 0 : 500);
      }
    };
    CRITICAL.forEach((src) => {
      const img = new Image();
      img.onload = done; img.onerror = done; img.src = src;
    });
    // safety: never trap the user
    const t = setTimeout(() => !cancelled && setGone(true), 6000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [reduced]);

  useEffect(() => {
    document.documentElement.style.overflow = gone ? '' : 'hidden';
  }, [gone]);

  if (gone) return null;
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-900 transition-opacity duration-700 ease-settle ${pct >= 100 ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden="true"
    >
      <div className="u-label mb-6 text-stone-400">DMF ENGINEERING</div>
      <div className="font-mono text-display-2 tabular-nums text-paper-50">{String(pct).padStart(3, '0')}<span className="text-accent">%</span></div>
      <div className="mt-8 h-px w-48 overflow-hidden bg-slate-700">
        <div className="h-full bg-accent transition-[width] duration-500 ease-settle" style={{ width: `${pct}%` }} />
      </div>
      <div className="u-label mt-6 text-stone-500">{pct >= 100 ? 'READY TO EXPLORE' : 'PREPARING THE JOURNEY'}</div>
    </div>
  );
}
