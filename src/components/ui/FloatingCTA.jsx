'use client';
import { SITE } from '@/lib/seo';
export default function FloatingCTA() {
  return (
    <a href={`mailto:${SITE.email}`}
      className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-sm bg-accent/90 px-4 py-3 font-mono text-label-sm uppercase text-paper-50 shadow-lg backdrop-blur-md transition-transform duration-500 ease-settle hover:-translate-y-0.5 hover:bg-accent-ink"
      aria-label="Contact DMF Engineering by email">
      <span aria-hidden>✉</span> Get in touch
    </a>
  );
}
