'use client';
import { useEffect, useRef } from 'react';

// Scroll-reveal: fades/rises children into view once. Optional stagger for lists.
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('reveal-in'); return; }
    el.classList.add('reveal-init');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => { el.classList.remove('reveal-init'); el.classList.add('reveal-in'); }, delay);
          io.disconnect();
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}
