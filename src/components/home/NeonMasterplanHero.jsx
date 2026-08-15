'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Captures each masterplan image, converts it to a glowing neon wireframe via
// Sobel edge-detection, and cross-evolves through them as you scroll — seen
// behind a wet tinted-glass foreground. Progressive enhancement: a static
// poster shows first and under reduced-motion.
export default function NeonMasterplanHero({ frames }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const neonRef = useRef([]);      // precomputed neon frame canvases
  const stateRef = useRef({ progress: 0, ready: false });
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const n = frames.length;

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    let raf, disposed = false;
    const DPR = Math.min(1.6, window.devicePixelRatio || 1);

    // ---- neon conversion (Sobel edge-detect + neon colorise + glow) ----
    function buildNeon(img) {
      const W = 960, H = 540;
      const base = document.createElement('canvas'); base.width = W; base.height = H;
      const b = base.getContext('2d');
      // cover-draw
      const ir = img.width / img.height, cr = W / H;
      let dw = W, dh = H, dx = 0, dy = 0;
      if (ir > cr) { dh = H; dw = H * ir; dx = (W - dw) / 2; } else { dw = W; dh = W / ir; dy = (H - dh) / 2; }
      b.drawImage(img, dx, dy, dw, dh);
      let src;
      try { src = b.getImageData(0, 0, W, H).data; } catch { return base; }
      const gray = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) gray[i] = (0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2]);
      const out = b.createImageData(W, H);
      const o = out.data;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const tl = gray[i - W - 1], tc = gray[i - W], tr = gray[i - W + 1];
          const ml = gray[i - 1], mr = gray[i + 1];
          const bl = gray[i + W - 1], bc = gray[i + W], br = gray[i + W + 1];
          const gx = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
          const gy = (bl + 2 * bc + br) - (tl + 2 * tc + tr);
          let mag = Math.sqrt(gx * gx + gy * gy) / 1442 * 255; // normalise
          mag = Math.min(255, mag * 2.4);
          const t = mag / 255;
          const j = i * 4;
          // neon ramp: dark -> cyan -> white, hottest edges bloom red
          o[j] = Math.min(255, t * 90 + Math.pow(t, 3) * 255);        // R (red on hot edges)
          o[j + 1] = Math.min(255, t * 232);                          // G (cyan)
          o[j + 2] = Math.min(255, t * 255 + 20);                     // B
          o[j + 3] = Math.min(255, t * 300);                          // A
        }
      }
      const edge = document.createElement('canvas'); edge.width = W; edge.height = H;
      const e = edge.getContext('2d'); e.putImageData(out, 0, 0);
      // composite with glow: dark ground + blurred bloom + sharp edges
      const res = document.createElement('canvas'); res.width = W; res.height = H;
      const r = res.getContext('2d');
      r.fillStyle = '#05070A'; r.fillRect(0, 0, W, H);
      r.globalCompositeOperation = 'lighter';
      r.filter = 'blur(6px)'; r.globalAlpha = 0.85; r.drawImage(edge, 0, 0);
      r.filter = 'blur(2px)'; r.globalAlpha = 0.9; r.drawImage(edge, 0, 0);
      r.filter = 'none'; r.globalAlpha = 1; r.drawImage(edge, 0, 0);
      r.globalCompositeOperation = 'source-over';
      return res;
    }

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // ---- render loop ----
    function drawCover(cv, W, H, scale, ox, oy) {
      const ir = cv.width / cv.height, cr = W / H;
      let dw, dh; if (ir > cr) { dh = H * scale; dw = dh * ir; } else { dw = W * scale; dh = dw / ir; }
      ctx.drawImage(cv, (W - dw) / 2 + ox, (H - dh) / 2 + oy, dw, dh);
    }
    function frame(time) {
      if (disposed) return;
      const W = canvas.clientWidth, H = canvas.clientHeight;
      const neon = neonRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#05070A'; ctx.fillRect(0, 0, W, H);
      if (neon.length) {
        const p = stateRef.current.progress;
        const f = p * (n - 1);
        let i = Math.floor(f); const frac = f - i;
        i = Math.max(0, Math.min(n - 1, i));
        const evolve = (i + frac);
        // current frame (slow zoom/drift as it "evolves")
        const z1 = 1.05 + (frac) * 0.12;
        const drift = Math.sin(time / 4000) * 8;
        if (neon[i]) { ctx.globalAlpha = 1; drawCover(neon[i], W, H, z1, drift, 0); }
        if (neon[i + 1] && frac > 0) { ctx.globalAlpha = frac; drawCover(neon[i + 1], W, H, 1.05 + frac * 0.12, -drift, 0); }
        ctx.globalAlpha = 1;
        // engineered overlay: moving scanline + hairline grid + vignette
        const gy = ((time / 26) % (H + 80)) - 40;
        const grad = ctx.createLinearGradient(0, gy - 40, 0, gy + 40);
        grad.addColorStop(0, 'rgba(60,232,255,0)'); grad.addColorStop(0.5, 'rgba(60,232,255,0.10)'); grad.addColorStop(1, 'rgba(60,232,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, gy - 40, W, 80);
        ctx.strokeStyle = 'rgba(120,200,255,0.05)'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
        vg.addColorStop(0, 'rgba(5,7,10,0)'); vg.addColorStop(1, 'rgba(5,7,10,0.85)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        const idx = Math.round(f);
        if (idx !== active) setActive(idx);
      }
      raf = requestAnimationFrame(frame);
    }

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      stateRef.current.progress = Math.max(0, Math.min(1, -rect.top / (total || 1)));
    }

    // ---- boot ----
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    raf = requestAnimationFrame(frame);

    // load + convert frames progressively
    let loaded = 0;
    frames.forEach((fr, idx) => {
      const img = new Image();
      img.onload = () => {
        if (disposed) return;
        neonRef.current[idx] = buildNeon(img);
        loaded++;
        if (loaded === 1) stateRef.current.ready = true;
      };
      img.src = asset(fr.img);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced, n, frames, active]);

  const cur = frames[Math.min(n - 1, active)] || frames[0];

  return (
    <section ref={sectionRef} className="relative bg-brand-coal" style={{ height: reduced ? 'auto' : '340vh' }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* neon canvas background */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* static poster fallback (no-JS / reduced motion) */}
        {reduced && (
          <img src={asset(frames[0].img)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}

        {/* foreground content in wet tinted glass */}
        <div className="u-container relative flex h-full flex-col justify-center">
          <div className="max-w-2xl">
            <p className="r-eyebrow text-[#4de3ff]">Masterplans · rendered live</p>
            <h1 className="mt-6 r-h text-[3rem] text-white sm:text-[4.2rem] md:text-[5.4rem]">
              The systems that make development possible.
            </h1>
            <p className="mt-6 max-w-xl font-ptsans text-lg leading-relaxed text-white/75">
              Every DMF masterplan, captured and re-drawn as living engineering — evolving as you move through the ground beneath the city.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/projects" className="rounded-full bg-brand-red px-7 py-3.5 font-raleway text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5">Explore the work</Link>
              <Link href="/expertise" className="font-raleway text-[12px] font-semibold uppercase tracking-[0.12em] text-white/85 hover:text-white">How we work →</Link>
            </div>
          </div>

          {/* live masterplan readout — wet glass */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8">
            <div className="u-container flex items-end justify-between gap-4">
              <div className="wet-glass pointer-events-auto max-w-sm rounded-2xl px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="font-raleway text-[11px] font-semibold tabular-nums text-[#4de3ff]">{String(active + 1).padStart(2, '0')}</span>
                  <span className="h-px flex-1 bg-white/25" />
                  <span className="font-raleway text-[11px] tabular-nums text-white/55">{String(n).padStart(2, '0')}</span>
                </div>
                <p className="mt-3 font-raleway text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4de3ff]">Master Plan · Neon capture</p>
                <p className="mt-1 r-h text-xl text-white">{cur.name}</p>
                {cur.location && <p className="mt-0.5 font-ptsans text-sm text-white/60">{cur.location}</p>}
              </div>
              {!reduced && (
                <div className="hidden items-center gap-2 font-raleway text-[10px] uppercase tracking-[0.24em] text-white/55 md:flex">
                  <span className="h-9 w-px animate-pulse bg-[#4de3ff]/60" />Scroll to evolve
                </div>
              )}
            </div>
            <div className="u-container mt-4">
              <div className="h-px w-full bg-white/12">
                <div className="h-full bg-[#4de3ff] transition-[width] duration-200" style={{ width: `${((active + 1) / n) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
