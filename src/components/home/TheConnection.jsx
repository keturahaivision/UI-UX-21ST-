'use client';
import { useState, useCallback } from 'react';
import Chapter from '@/components/chapters/Chapter';
import { asset } from '@/lib/asset';

// The connection — a line on paper becomes ground. Plan dissolves to built, same site.
export default function TheConnection() {
  const [p, setP] = useState(0);
  const onProgress = useCallback((v) => setP(v), []);
  return (
    <Chapter id="connection" index={3} tone="dark" pin scrub={2} onProgress={onProgress}>
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <img src={asset('/images/2015_07_Wb_NAH-Masterplan.webp')} alt="Nadd Al Hamar master plan by DMF Engineering" className="absolute inset-0 h-full w-full object-cover" />
          <img src={asset('/images/2015_07_Wb_NAH-01.webp')} alt="Nadd Al Hamar as built, aerial view" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: p }} />
          {/* base + horizontal scrims so the centred text columns stay >=4.5:1 over bright imagery */}
          <div className="absolute inset-0 bg-ink-900/55" />
          <div className="absolute inset-0 u-scrim-dark" />
        </div>
        <div className="u-container relative z-10 flex min-h-screen items-start py-24 lg:items-center lg:py-0">
          <div className="grid w-full gap-10 lg:grid-cols-3">
            <div>
              <p className="u-label text-accent-soft">The connection · Nadd Al Hamar</p>
              <h2 className="mt-4 font-display text-display-3 leading-[0.95] text-paper-50">From plan<br />to place.</h2>
              <p className="mt-8 font-mono text-label-sm text-paper-50/60">DUBAI, UAE · MASTER PLAN + ROADS &amp; INFRASTRUCTURE · CLIENT: WASL</p>
            </div>
            <div>
              <p className="font-mono text-label-sm text-paper-50/75">CHALLENGE</p>
              <p className="mt-3 font-body text-body text-paper-50/90">Turn a bare parcel on Sheikh Mohammed Bin Zayed Road into a serviced residential community.</p>
              <p className="mt-6 font-mono text-label-sm text-paper-50/75">APPROACH</p>
              <p className="mt-3 font-body text-body text-paper-50/90">Detailed master plan, road geometry and full wet &amp; dry infrastructure — coordinated to the plot line.</p>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className="font-mono text-label-sm text-paper-50/75">OUTCOME</p>
                <p className="mt-3 font-body text-body text-paper-50/90">The drawing, built. Planning, engineering and delivery meeting on the same ground — where DMF lives.</p>
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
  );
}
