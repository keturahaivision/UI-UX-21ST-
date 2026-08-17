'use client';
import { useState, useCallback } from 'react';
import Chapter from './Chapter';
import SurveyLines from './SurveyLines';
import { asset } from '@/lib/asset';

// Ch2 — the plan draws itself, then the real DMF masterplan resolves beneath the lines.
export default function ChapterVision() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  const planFade = Math.max(0, (p - 0.45) / 0.5); // plan image fades in second half

  return (
    <Chapter id="vision" index={2} label="Vision" tone="dark" pin scrub={1.6} onProgress={onProgress}>
      <div className="relative flex min-h-screen items-center">
        <div className="u-container grid w-full items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          {/* pinned side text — real About copy */}
          <div className="relative z-10">
            <p className="u-label text-accent-soft">Who we are</p>
            <h2 className="mt-6 font-display text-h2 text-paper-50">A plan is a promise to the ground.</h2>
            <p className="mt-6 max-w-prose font-body text-body text-paper-50/80">
              DMF Engineering, founded by David Ghosheh, has earned a strong reputation for delivering
              innovative and sustainable engineering solutions across the UAE, the Gulf region, and worldwide —
              blending creativity, technical expertise, and integrity on every master plan we draw.
            </p>
          </div>
          {/* drawing canvas */}
          <div className="relative aspect-[12/7] w-full overflow-hidden rounded-xs border border-slate-700 bg-ink-800">
            <img src={asset('/images/2015_07_Wb_NAH-Masterplan.webp')} alt="Nadd Al Hamar master plan drawing by DMF Engineering"
              className="absolute inset-0 h-full w-full object-cover transition-opacity"
              style={{ opacity: planFade }} />
            <div className="absolute inset-0" style={{ opacity: 1 - planFade * 0.85 }}>
              <SurveyLines progress={Math.min(1, p * 1.8)} className="h-full w-full" stroke="#D81F2A" />
            </div>
            <span className="absolute bottom-3 left-3 font-mono text-label-sm text-paper-50/70">NADD AL HAMAR · MASTER PLAN</span>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
