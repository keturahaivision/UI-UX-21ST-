'use client';
import { useRef, useState, useLayoutEffect } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { asset } from '@/lib/asset';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Scroll-scrubbed cinematic hero: a pinned viewport that cross-dissolves through
// DMF's real project imagery as you scroll — a "scroll video" built from stills.
// A real <video> can drop into the same pinned stage later. Progressive
// enhancement: without JS / with reduced-motion it renders a static first frame.
export default function CinematicHero({ projects }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const n = projects.length;

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray('.hero-slide');
      const headline = root.current.querySelector('.hero-headline');
      gsap.set(slides, { opacity: 0, scale: 1.14 });
      gsap.set(slides[0], { opacity: 1, scale: 1.06 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + Math.max(1, n) * 62 + '%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(n - 1, Math.floor(self.progress * n + 0.0001));
            setActive(idx);
          },
        },
      });

      // slow drift on the first frame, then cross-dissolve through the rest
      tl.to(slides[0], { scale: 1.0, ease: 'none', duration: 1 }, 0);
      tl.to(headline, { opacity: 0, y: -40, ease: 'none', duration: 0.6 }, 0.15);
      for (let i = 1; i < n; i++) {
        const at = i / n;
        tl.to(slides[i - 1], { opacity: 0, ease: 'none', duration: 1 / n }, at)
          .fromTo(slides[i], { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1.02, ease: 'none', duration: 1 / n }, at);
      }
    }, root);
    return () => ctx.revert();
  }, [reduced, n]);

  const p = projects[active] || projects[0];

  return (
    <section ref={root} className="relative h-[100svh] w-full overflow-hidden bg-brand-coal">
      {/* image stack */}
      <div className="absolute inset-0">
        {projects.map((proj, i) => (
          <div key={proj.slug} className="hero-slide absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
            <img src={asset(proj.hero)} alt={proj.name} className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="absolute inset-0 u-scrim-dark" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_0%,#000_30%,transparent_85%)]" />
      </div>

      {/* headline (fades out as the sequence begins) */}
      <div className="hero-headline u-container pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
        <p className="r-eyebrow text-brand-red">Engineering &amp; infrastructure consultants · Dubai</p>
        <h1 className="mt-6 max-w-[15ch] r-h text-[3rem] text-white sm:text-[4.4rem] md:text-[6rem]">
          The systems that make development possible.
        </h1>
        <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4">
          <Link href="/projects" className="rounded-full bg-brand-red px-7 py-3.5 font-raleway text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5">Explore the work</Link>
          <Link href="/expertise" className="font-raleway text-[12px] font-semibold uppercase tracking-[0.12em] text-white/85 hover:text-white">How we work →</Link>
        </div>
      </div>

      {/* live project metadata tile — updates as the imagery scrubs */}
      <div className="u-container pointer-events-none absolute inset-x-0 bottom-8 z-10">
        <div className="flex items-end justify-between gap-4">
          <div className="tile pointer-events-auto max-w-sm rounded-2xl px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="font-raleway text-[11px] font-semibold tabular-nums text-brand-red">{String(active + 1).padStart(2, '0')}</span>
              <span className="h-px flex-1 bg-white/20" />
              <span className="font-raleway text-[11px] tabular-nums text-white/50">{String(n).padStart(2, '0')}</span>
            </div>
            <p className="mt-3 font-raleway text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">{p.disciplineDisplay || p.disciplines?.[0]}</p>
            <p className="mt-1 r-h text-xl text-white">{p.name}</p>
            {p.location && <p className="mt-0.5 font-ptsans text-sm text-white/60">{p.location}</p>}
          </div>
          <div className="hidden items-center gap-2 font-raleway text-[10px] uppercase tracking-[0.24em] text-white/55 md:flex">
            <span className="h-9 w-px animate-pulse bg-white/40" />Scroll
          </div>
        </div>
        {/* scrub progress */}
        <div className="mt-4 h-px w-full bg-white/12">
          <div className="h-full bg-brand-red transition-[width] duration-300" style={{ width: `${((active + 1) / n) * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
