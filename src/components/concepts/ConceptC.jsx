'use client';
import { useState, useCallback } from 'react';
import Chapter from '@/components/chapters/Chapter';
import ConceptBar from './ConceptBar';
import { asset } from '@/lib/asset';

// Editorial: a line on paper becomes a road under wheels. Same site, plan -> built.
export default function ConceptC() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  return (
    <div className="bg-paper-50 text-ink-900">
      <ConceptBar id="C" name="From Plan to Place" tone="light" />

      {/* HERO — editorial, plan-led */}
      <section className="relative flex min-h-screen items-end overflow-hidden bg-paper-50">
        <img src={asset('/images/2015_07_Wb_NAH-Masterplan.webp')} alt="Nadd Al Hamar master plan by DMF Engineering"
          className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper-50 via-paper-50/30 to-transparent" />
        <div className="u-container relative z-10 pb-20">
          <div className="mb-6 font-mono text-label-sm text-accent">03 / POSITIONING · THE EDITORIAL VIEW</div>
          <h1 className="max-w-4xl font-display text-display-1 leading-[0.9] tracking-tightest text-ink-900">From plan<br />to place.</h1>
          <p className="mt-8 max-w-xl font-body text-body-lg text-slate-700">A line on paper becomes a road under wheels. Every DMF project is the story of drawing becoming ground — master planning, engineering, delivery.</p>
        </div>
      </section>

      {/* THE DISSOLVE — plan cross-fades to built, with a technical spine */}
      <Chapter id="dissolve" index={4} label="Plan → Place" tone="dark" pin scrub={2} onProgress={onProgress}>
        <div className="relative min-h-screen">
          <div className="absolute inset-0">
            <img src={asset('/images/2015_07_Wb_NAH-Masterplan.webp')} alt="Nadd Al Hamar master plan" className="absolute inset-0 h-full w-full object-cover" />
            <img src={asset('/images/2015_07_Wb_NAH-01.webp')} alt="Nadd Al Hamar as built" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: p }} />
            <div className="absolute inset-0 u-scrim-dark" />
          </div>
          <div className="u-container relative z-10 flex min-h-screen items-center">
            <div className="grid w-full gap-10 lg:grid-cols-3">
              <div className="reveal-in">
                <p className="u-label text-accent">Case · Nadd Al Hamar</p>
                <p className="mt-4 font-mono text-label-sm text-paper-50/60">DUBAI, UAE · MASTER PLAN + ROADS & INFRASTRUCTURE · CLIENT: WASL</p>
              </div>
              <div>
                <p className="font-mono text-label-sm text-paper-50/50">CHALLENGE</p>
                <p className="mt-3 font-body text-body text-paper-50/85">Turn a bare parcel on Sheikh Mohammed Bin Zayed Road into a serviced residential community.</p>
                <p className="mt-6 font-mono text-label-sm text-paper-50/50">APPROACH</p>
                <p className="mt-3 font-body text-body text-paper-50/85">Detailed master plan, road geometry, and full wet/dry infrastructure — coordinated to the plot line.</p>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <p className="font-mono text-label-sm text-paper-50/50">OUTCOME</p>
                  <p className="mt-3 font-body text-body text-paper-50/85">The drawing, built. Same footprint, now streets and homes.</p>
                </div>
                <div className="mt-8 flex items-center gap-3 font-mono text-label-sm text-paper-50/70">
                  <span>PLAN</span>
                  <div className="h-px w-32 bg-slate-600"><div className="h-full bg-accent" style={{ width: `${p * 100}%` }} /></div>
                  <span>BUILT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Chapter>
    </div>
  );
}
