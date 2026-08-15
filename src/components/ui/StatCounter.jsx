'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function StatCounter({ value, label, suffix = '', duration = 1400 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) { setN(value); return; }
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // expo-out feel
          setN(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [value, duration, reduced]);
  return (
    <div ref={ref} className="flex flex-col">
      <span className="font-display text-5xl font-bold tabular-nums leading-none tracking-[-0.02em] text-sys-ink md:text-6xl">
        {String(n).padStart(2, '0')}{suffix}
      </span>
      <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-sys-faint">{label}</span>
    </div>
  );
}
