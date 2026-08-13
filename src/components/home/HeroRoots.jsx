'use client';
import { useState, useCallback } from 'react';
import { asset } from '@/lib/asset';
import Reveal from '@/components/motion/Reveal';
import Chapter from '@/components/chapters/Chapter';

// The city above — a built development, positioning stated over it.
export default function HeroRoots() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  return (
    <Chapter id="hero" index={1} tone="dark" pin scrub={1.2} onProgress={onProgress}>
      <div className="absolute inset-0">
        <img src={asset('/images/2015_07_Wb_NAH-01.webp')} alt="A DMF-engineered residential community, aerial view"
          className="h-full w-full object-cover" style={{ transform: `scale(${1.06 + p * 0.05})`, filter: `brightness(${0.72 - p * 0.25})` }} />
        <div className="absolute inset-0 u-scrim-dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/30 to-ink-900" style={{ opacity: 0.4 + p * 0.6 }} />
      </div>
      <div className="u-container relative z-10 flex min-h-screen flex-col justify-center">
        <div className="mb-8 flex flex-wrap items-center gap-4 font-mono text-label-sm text-stone-300">
          <span className="text-accent">DMF ENGINEERING</span><span className="opacity-40">·</span><span>DUBAI · UAE · 25°16′N 55°19′E</span>
        </div>
        <Reveal as="h1" className="max-w-5xl font-display text-display-1 leading-[0.9] tracking-tightest text-paper-50">
          Engineering<br />the roots of<br />development.
        </Reveal>
        <Reveal as="p" className="mt-8 max-w-xl font-body text-body-lg text-paper-50/75">
          Beneath every successful development is a system that makes it work — roads, utilities, drainage, mobility, master planning, structures. That is the level DMF works at.
        </Reveal>
        <Reveal as="div" className="mt-10 flex flex-wrap gap-4">
          <a href="/projects" className="rounded-sm bg-accent px-7 py-4 font-mono text-label uppercase text-paper-50 transition-colors duration-500 ease-settle hover:bg-accent-ink">Explore our work</a>
          <a href="/contact" className="rounded-sm border border-slate-600 px-7 py-4 font-mono text-label uppercase text-paper-50 transition-colors hover:border-stone-400">Start a conversation</a>
        </Reveal>
        <span className="mt-14 font-mono text-label-sm text-paper-50/50">↓ THE CITY ABOVE — SCROLL TO WHAT MAKES IT WORK</span>
      </div>
    </Chapter>
  );
}
