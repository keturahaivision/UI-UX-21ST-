'use client';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { SITE } from '@/lib/seo';

// Light Refined footer — dark ink block for contrast, editorial closing line.
export default function SiteFooter() {
  return (
    <footer className="bg-dmf-ink text-white">
      <div className="u-container py-20">
        <blockquote className="max-w-3xl font-fraunces text-3xl font-medium leading-tight md:text-4xl">
          Engineering the systems that make development possible.
        </blockquote>
        <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/50">DMF Engineering · Dubai</p>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-11 w-auto brightness-0 invert" />
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/expertise" className="u-link-underline hover:text-white">Expertise</Link></li>
              <li><Link href="/projects" className="u-link-underline hover:text-white">Projects</Link></li>
              <li><Link href="/about" className="u-link-underline hover:text-white">About</Link></li>
              <li><Link href="/partnerships" className="u-link-underline hover:text-white">Partnerships</Link></li>
              <li><Link href="/insights" className="u-link-underline hover:text-white">Insights</Link></li>
              <li><Link href="/careers" className="u-link-underline hover:text-white">Careers</Link></li>
              <li><Link href="/contact" className="u-link-underline hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">Office in Dubai</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{SITE.address}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="u-link-underline hover:text-white">{SITE.phone}</a></li>
              {SITE.email && <li><a href={`mailto:${SITE.email}`} className="u-link-underline hover:text-white">{SITE.email}</a></li>}
              <li><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="u-link-underline hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40 md:flex-row">
          <span>© {new Date().getFullYear()} DMF Engineering</span>
          <span>Architectural &amp; engineering consultants · UAE &amp; the Gulf</span>
        </div>
      </div>
    </footer>
  );
}
