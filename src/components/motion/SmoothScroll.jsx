'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from '@studio-freight/lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

let lenisSingleton = null;
export function getLenis() { return lenisSingleton; }

export default function SmoothScroll({ children }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return; // native scroll under reduced-motion
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenisSingleton = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisSingleton = null;
    };
  }, [reduced]);

  // Route change: reset scroll + kill stale triggers so pins don't leak across pages
  useEffect(() => {
    if (lenisSingleton) lenisSingleton.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    ScrollTrigger.getAll().forEach((t) => t.kill());
    ScrollTrigger.refresh();
  }, [pathname]);

  return children;
}
