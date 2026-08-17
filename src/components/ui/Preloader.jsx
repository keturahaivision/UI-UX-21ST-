'use client';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Branded first-load curtain: logo reveal + engineered count-up, then a lift-away.
// Shows once per browser session so internal navigation stays instant.
export default function Preloader() {
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [state, setState] = useState('idle'); // idle | active | leaving | done

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = sessionStorage.getItem('dmf_preloaded');
    if (seen || reduced) { setState('done'); return; }
    setState('active');
    document.documentElement.style.overflow = 'hidden';

    const start = performance.now();
    const DUR = 1500;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setState('leaving');
        setTimeout(() => {
          setState('done');
          document.documentElement.style.overflow = '';
          sessionStorage.setItem('dmf_preloaded', '1');
        }, 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.documentElement.style.overflow = ''; };
  }, [reduced]);

  if (state === 'done' || state === 'idle') return null;

  return (
    <div aria-hidden className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-brand-coal transition-[clip-path,opacity] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] ${state === 'leaving' ? '[clip-path:inset(0_0_100%_0)] opacity-0' : '[clip-path:inset(0_0_0_0)] opacity-100'}`}>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative flex flex-col items-center">
        <img src={asset('/dmf-logo.png')} alt="DMF Engineering"
          className="h-16 w-auto brightness-0 invert md:h-20"
          style={{ opacity: Math.min(1, pct / 40), transform: `translateY(${(1 - Math.min(1, pct / 60)) * 10}px)` }} />
        <div className="mt-8 h-px w-56 overflow-hidden bg-white/12">
          <div className="h-full bg-brand-red" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex w-56 items-center justify-between font-raleway text-[11px] uppercase tracking-[0.24em] text-white/55">
          <span>Engineering the systems</span>
          <span className="tabular-nums text-white/80">{String(pct).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );
}
