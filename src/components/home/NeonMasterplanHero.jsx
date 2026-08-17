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
      // Downscale then smooth-upscale so fine plot texture drops out and only the
      // major plan lines (roads, boundaries, blocks) survive → clean single lines.
      const sw = 440, sh = 248;
      const small = document.createElement('canvas'); small.width = sw; small.height = sh;
      const sc = small.getContext('2d');
      const ir = img.width / img.height, cr = sw / sh;
      let dw = sw, dh = sh, dx = 0, dy = 0;
      if (ir > cr) { dh = sh; dw = sh * ir; dx = (sw - dw) / 2; } else { dw = sw; dh = sw / ir; dy = (sh - dh) / 2; }
      sc.drawImage(img, dx, dy, dw, dh);
      const base = document.createElement('canvas'); base.width = W; base.height = H;
      const b = base.getContext('2d');
      b.imageSmoothingEnabled = true; b.imageSmoothingQuality = 'high';
      b.drawImage(small, 0, 0, W, H);
      let src;
      try { src = b.getImageData(0, 0, W, H).data; } catch { return base; }
      const gray = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) gray[i] = (0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2]);
      const out = b.createImageData(W, H);
      const o = out.data;
      const T = 66; // high edge threshold → only the major plan lines, no fills / shading
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const tl = gray[i - W - 1], tc = gray[i - W], tr = gray[i - W + 1];
          const ml = gray[i - 1], mr = gray[i + 1];
          const bl = gray[i + W - 1], bc = gray[i + W], br = gray[i + W + 1];
          const gx = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
          const gy = (bl + 2 * bc + br) - (tl + 2 * tc + tr);
          let mag = Math.sqrt(gx * gx + gy * gy) / 1442 * 255;
          mag = Math.min(255, mag * 2.6);
          let a = 0;
          if (mag > T) a = 235;
          else if (mag > T * 0.55) a = ((mag - T * 0.55) / (T * 0.45)) * 150; // soft AA edge only
          const j = i * 4;
          o[j] = 0x4d; o[j + 1] = 0xe3; o[j + 2] = 0xff; o[j + 3] = a; // single cyan line, transparent ground
        }
      }
      const edge = document.createElement('canvas'); edge.width = W; edge.height = H;
      edge.getContext('2d').putImageData(out, 0, 0);
      return edge; // transparent thin-line wireframe
    }

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // ---- render loop ----
    // 2:1 isometric projection of the flat plan — single-line, no shading.
    function drawIso(cv, W, H, alpha, zoom, dy) {
      const EW = cv.width, EH = cv.height;
      const s = Math.min(W / (0.866 * (EW + EH)), H / (0.5 * (EW + EH))) * 1.5 * zoom;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = 'rgba(77,227,255,0.5)'; ctx.shadowBlur = 3; // faint neon halo on the lines only
      ctx.translate(W / 2, H * 0.52 + dy);
      ctx.transform(0.866 * s, 0.5 * s, -0.866 * s, 0.5 * s, 0, 0);
      ctx.drawImage(cv, -EW / 2, -EH / 2, EW, EH);
      ctx.restore();
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
        const bob = Math.sin(time / 3600) * 6;
        // cross-evolve between two isometric plans; they rise/settle as they swap
        if (neon[i]) drawIso(neon[i], W, H, 1, 1 + frac * 0.05, bob - frac * 26);
        if (neon[i + 1] && frac > 0) drawIso(neon[i + 1], W, H, frac, 0.97 + frac * 0.05, bob + (1 - frac) * 26);
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        // one moving scan-line (engineering feel — no fills on the plan itself)
        const gy = ((time / 24) % (H + 60)) - 30;
        const grad = ctx.createLinearGradient(0, gy - 26, 0, gy + 26);
        grad.addColorStop(0, 'rgba(77,227,255,0)'); grad.addColorStop(0.5, 'rgba(77,227,255,0.07)'); grad.addColorStop(1, 'rgba(77,227,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, gy - 26, W, 52);
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.34, W / 2, H / 2, H * 0.85);
        vg.addColorStop(0, 'rgba(5,7,10,0)'); vg.addColorStop(1, 'rgba(5,7,10,0.78)');
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
