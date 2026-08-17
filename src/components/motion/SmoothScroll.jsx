'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from '@studio-freight/lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

let lenisSingleton = null;
export function getLenis() { return lenisSingleton; }

export default function SmoothScroll({ children }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const mounted = useRef(false);

  useEffect(() => {
    if (reduced) return; // native scroll under reduced-motion
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenisSingleton = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // Triggers may be created before images/layout settle (preloader). Re-measure a few times.
    const refresh = () => ScrollTrigger.refresh();
    const refreshes = [400, 1200, 2600].map((t) => setTimeout(refresh, t));
    window.addEventListener('load', refresh);
    return () => {
      refreshes.forEach(clearTimeout);
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisSingleton = null;
    };
  }, [reduced]);

  // Route change ONLY (not first mount): leaving a page unmounts its chapters, whose
  // gsap.context cleans their own triggers — so here we just reset scroll + re-measure.
  // (Killing triggers on mount here previously wiped freshly-created chapter pins.)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (lenisSingleton) lenisSingleton.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(t);
  }, [pathname]);

  return children;
}
