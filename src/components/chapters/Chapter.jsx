'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Pinning is a desktop affordance; below lg the design system requires chapters
// to relax into a normal vertical stack (per DMF_DESIGN_SYSTEM.md).
function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setDesktop(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop;
}

/**
 * The single narrative primitive. Every homepage chapter is a config of this.
 * - pin: hold the section while `scrub` length of scroll drives progress
 * - onProgress(p): 0..1 scrub progress, for line-draw / cross-fade / parallax
 * - tone: 'dark' | 'light' sets the chapter background from the token palette
 * Under reduced motion: no pin, content stacks and reveals instantly.
 */
export default function Chapter({
  id, label, index, tone = 'dark', pin = false, scrub = 1, onProgress,
  className = '', children,
}) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const canPin = pin && !reduced && isDesktop;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // reveal children marked [data-reveal]
      const items = el.querySelectorAll('[data-reveal]');
      if (!reduced && items.length) {
        gsap.set(items, { opacity: 0, y: 28 });
        ScrollTrigger.create({
          trigger: el, start: 'top 70%',
          onEnter: () => gsap.to(items, {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
          }),
          once: true,
        });
      } else if (items.length) {
        gsap.set(items, { opacity: 1, y: 0 });
      }

      if (canPin) {
        const st = ScrollTrigger.create({
          trigger: el, start: 'top top', end: `+=${scrub * 100}%`,
          pin: true, scrub: 1, anticipatePin: 1,
          onUpdate: (self) => onProgress && onProgress(self.progress),
        });
        return () => st.kill();
      } else if (onProgress) {
        onProgress(reduced || !isDesktop ? 1 : 0); // static end-state when not pinning
      }
    }, el);
    return () => ctx.revert();
  }, [pin, scrub, onProgress, reduced, canPin, isDesktop]);

  const bg = tone === 'light' ? 'bg-paper-50 text-ink-900' : tone === 'mid' ? 'bg-slate-700 text-paper-50' : 'bg-ink-900 text-paper-50';
  // When pinning is active the section must clip; when relaxed (mobile/reduced) it
  // must be allowed to grow past the viewport so stacked content never clips.
  return (
    <section
      ref={root} id={id} data-chapter={index} data-tone={tone}
      className={`relative w-full min-h-screen ${canPin ? 'overflow-hidden' : 'py-24'} ${bg} ${className}`}
      aria-label={label ? `Chapter ${index}: ${label}` : undefined}
    >
      {label && (
        <span className="pointer-events-none absolute left-6 top-24 z-20 u-label md:left-10">
          <span className="text-accent-soft">{String(index).padStart(2, '0')}</span>
          <span className="mx-2 text-current opacity-40">/</span>
          <span className="opacity-90">{label}</span>
        </span>
      )}
      {children}
    </section>
  );
}
