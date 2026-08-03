'use client';
import { useState, useCallback } from 'react';
import Chapter from './Chapter';
import Reveal from '@/components/motion/Reveal';
import SurveyLines from './SurveyLines';

export default function ChapterLand() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  return (
    <Chapter id="land" index={1} label="Land" tone="dark" pin scrub={1.4} onProgress={onProgress}>
      {/* raw terrain */}
      <div className="absolute inset-0">
        <img src="/images/ch1-land.webp" alt="Raw reclaimed land before development — a DMF Engineering site emerging from the sea"
          className="h-full w-full object-cover" style={{ transform: `scale(${1.12 + p * 0.06})`, filter: `saturate(${0.5 + p * 0.3}) brightness(${0.6 + p * 0.22})` }} />
        <div className="absolute inset-0 bg-ink-900/50" />
        <div className="absolute inset-0 u-scrim-dark" />
      </div>
      {/* survey grid fades/draws in as you scroll */}
      <div className="absolute inset-0 opacity-70" style={{ opacity: 0.15 + p * 0.6 }}>
        <SurveyLines progress={p} className="h-full w-full" stroke="#D81F2A" />
      </div>
      {/* headline */}
      <div className="u-container relative z-10 flex min-h-screen flex-col justify-end pb-28">
        <Reveal as="h1" className="max-w-4xl font-display text-display-1 text-paper-50">
          Every city begins<br />as a question.
        </Reveal>
        <Reveal as="p" className="mt-8 max-w-md font-body text-body-lg text-paper-50/80">
          Before the skyline, there is only ground — and the discipline to imagine what it could hold.
        </Reveal>
        <span className="u-label mt-10 animate-pulse text-paper-50/60">Scroll to build ↓</span>
      </div>
    </Chapter>
  );
}
