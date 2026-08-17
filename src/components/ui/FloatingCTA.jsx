'use client';
import { SITE } from '@/lib/seo';
export default function FloatingCTA() {
  // Prefer email when confirmed, else route to the contact page (no invented address).
  const href = SITE.email ? `mailto:${SITE.email}` : '/contact';
  return (
    <a href={href}
      className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-sm bg-accent/90 px-4 py-3 font-mono text-label-sm uppercase text-paper-50 shadow-lg backdrop-blur-md transition-transform duration-500 ease-settle hover:-translate-y-0.5 hover:bg-accent-ink"
      aria-label="Contact DMF Engineering">
      <span aria-hidden>✉</span> Get in touch
    </a>
  );
}
