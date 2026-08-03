'use client';
import { useState, useCallback } from 'react';
import Chapter from './Chapter';

// Ch3 — same site: masterplan cross-fades into the built aerial, bound to scroll.
export default function ChapterStructure() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  return (
    <Chapter id="structure" index={3} label="Structure" tone="mid" pin scrub={1.6} onProgress={onProgress}>
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          {/* plan (before) */}
          <img src="/images/2015_07_Wb_NAH-Masterplan.webp" alt="Nadd Al Hamar master plan"
            className="absolute inset-0 h-full w-full object-cover" />
          {/* built (after) revealed by scroll */}
          <img src="/images/2015_07_Wb_NAH-01.webp" alt="Nadd Al Hamar community as built — aerial view"
            className="absolute inset-0 h-full w-full object-cover" style={{ opacity: p }} />
          <div className="absolute inset-0 u-scrim-dark" />
          {/* progress seam */}
          <div className="absolute inset-y-0 w-px bg-accent/80" style={{ left: `${p * 100}%` }} aria-hidden />
        </div>
        <div className="u-container relative z-10 flex min-h-screen flex-col justify-center">
          <p className="u-label text-accent">Drawing → built</p>
          <h2 className="mt-6 max-w-3xl font-display text-display-2 text-paper-50">The same ground,<br />now a neighbourhood.</h2>
          <p className="mt-8 max-w-md font-body text-body-lg text-paper-50/80">
            What began as survey lines becomes streets, homes and infrastructure — Nadd Al Hamar, delivered.
          </p>
          <div className="mt-10 flex items-center gap-4 font-mono text-label-sm text-paper-50/70">
            <span>PLAN</span>
            <div className="h-px w-40 bg-slate-600"><div className="h-full bg-accent" style={{ width: `${p * 100}%` }} /></div>
            <span>BUILT</span>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
