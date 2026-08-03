'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
if (typeof window !== 'undefined') {
  if (!gsap.core.globals().ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (process.env.NODE_ENV !== 'production') {
    window.gsap = gsap;
    window.ScrollTrigger = ScrollTrigger; // debug handle in dev only
  }
}
export { gsap, ScrollTrigger };
