'use client';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { SITE } from '@/lib/seo';

// Systems Layer footer — deep ground with a red top rule and engineered labels.
export default function SiteFooter() {
  return (
    <footer className="relative border-t border-sys-line bg-sys-ground text-sys-ink">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sys-red to-transparent opacity-60" />
      <div className="u-container py-20">
        <p className="r-eyebrow">DMF Engineering · Dubai</p>
        <blockquote className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] md:text-4xl">
          Engineering the systems that make development possible.
        </blockquote>

        <div className="mt-16 grid gap-10 border-t border-sys-line pt-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-11 w-auto brightness-0 invert" />
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sys-faint">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-sys-muted">
              <li><Link href="/expertise" className="u-link-underline hover:text-sys-ink">Expertise</Link></li>
              <li><Link href="/projects" className="u-link-underline hover:text-sys-ink">Projects</Link></li>
              <li><Link href="/about" className="u-link-underline hover:text-sys-ink">About</Link></li>
              <li><Link href="/partnerships" className="u-link-underline hover:text-sys-ink">Partnerships</Link></li>
              <li><Link href="/insights" className="u-link-underline hover:text-sys-ink">Insights</Link></li>
              <li><Link href="/careers" className="u-link-underline hover:text-sys-ink">Careers</Link></li>
              <li><Link href="/contact" className="u-link-underline hover:text-sys-ink">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sys-faint">Office in Dubai</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sys-muted">{SITE.address}</p>
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sys-faint">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-sys-muted">
              <li><a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="u-link-underline hover:text-sys-ink">{SITE.phone}</a></li>
              {SITE.email && <li><a href={`mailto:${SITE.email}`} className="u-link-underline hover:text-sys-ink">{SITE.email}</a></li>}
              <li><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="u-link-underline hover:text-sys-ink">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-sys-line pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-sys-faint md:flex-row">
          <span>© {new Date().getFullYear()} DMF Engineering</span>
          <span>Architectural &amp; engineering consultants · UAE &amp; the Gulf</span>
        </div>
      </div>
    </footer>
  );
}
