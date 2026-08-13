'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import ProjectCard from '@/components/ui/ProjectCard';
import data from '@/data/content.json';

// Ch5 — vertical scroll translates the flagship row horizontally (pinned).
export default function ChapterWork() {
  const section = useRef(null);
  const track = useRef(null);
  const reduced = useReducedMotion();
  const flagships = data.flagships;

  useEffect(() => {
    if (reduced) return;
    const sec = section.current, tr = track.current;
    if (!sec || !tr) return;
    const ctx = gsap.context(() => {
      const distance = tr.scrollWidth - window.innerWidth + 96;
      if (distance <= 0) return;
      gsap.to(tr, {
        x: -distance, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${distance}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
    }, sec);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} id="work" className="relative min-h-screen overflow-hidden bg-ink-900 text-paper-50" aria-label="Chapter 5: Work">
      <span className="pointer-events-none absolute left-6 top-24 z-20 u-label md:left-10">
        <span className="text-accent-soft">05</span><span className="mx-2 opacity-40">/</span><span>Work</span>
      </span>
      <div className={`flex ${reduced ? 'flex-col' : 'min-h-screen items-center'}`}>
        <div ref={track} className={`flex gap-6 px-6 md:px-10 ${reduced ? 'flex-col' : 'w-max flex-row items-stretch'}`}>
          <div className={`flex flex-col justify-center ${reduced ? 'py-16' : 'w-[60vw] max-w-md pr-6'}`}>
            <p className="u-label text-accent-soft">Selected work</p>
            <h2 className="mt-6 font-display text-display-3">The portfolio<br />that answers.</h2>
            <p className="mt-6 max-w-sm font-body text-body text-paper-50/70">A cross-section of {data.stats.total_projects} projects across master planning, infrastructure and architecture.</p>
            <Link href="/projects" className="mt-8 inline-block u-label u-link-underline text-paper-50">View all projects →</Link>
          </div>
          {flagships.map((p) => (
            <ProjectCard key={p.slug} project={p} wide className={reduced ? 'w-full' : 'w-[78vw] max-w-sm shrink-0'} />
          ))}
        </div>
      </div>
    </section>
  );
}
