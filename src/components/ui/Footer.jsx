'use client';
import Link from 'next/link';
import { SITE } from '@/lib/seo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-ink-900 text-paper-50">
      <div className="u-container py-20">
        <blockquote className="max-w-3xl font-display text-h3 leading-tight text-paper-50">
          &ldquo;At DMF, innovation, expertise, and dedication converge to redefine excellence in architectural and engineering solutions.&rdquo;
        </blockquote>
        <p className="u-label mt-4 text-stone-400">DMF ENGINEERING</p>

        <div className="mt-16 grid gap-10 border-t border-slate-700 pt-10 md:grid-cols-4">
          <div>
            <p className="u-label text-stone-500">Explore</p>
            <ul className="mt-4 space-y-2 font-body text-caption">
              <li><Link href="/expertise" className="u-link-underline">Expertise</Link></li>
              <li><Link href="/projects" className="u-link-underline">Projects</Link></li>
              <li><Link href="/about" className="u-link-underline">About</Link></li>
              <li><Link href="/partnerships" className="u-link-underline">Partnerships</Link></li>
              <li><Link href="/insights" className="u-link-underline">Insights</Link></li>
              <li><Link href="/careers" className="u-link-underline">Careers</Link></li>
              <li><Link href="/contact" className="u-link-underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="u-label text-stone-500">Office in Dubai</p>
            <p className="mt-4 max-w-xs font-body text-caption text-stone-300">{SITE.address}</p>
          </div>
          <div>
            <p className="u-label text-stone-500">Contact</p>
            <ul className="mt-4 space-y-2 font-body text-caption">
              <li><a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="u-link-underline">{SITE.phone}</a></li>
              <li><a href={`mailto:${SITE.email}`} className="u-link-underline">{SITE.email}</a></li>
            </ul>
          </div>
          <div>
            <p className="u-label text-stone-500">Follow</p>
            <ul className="mt-4 space-y-2 font-body text-caption">
              <li><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="u-link-underline">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-slate-700 pt-6 font-mono text-label-sm text-stone-500 md:flex-row">
          <span>© {new Date().getFullYear()} DMF Engineering. All rights reserved.</span>
          <span>Building a brighter future, together.</span>
        </div>
      </div>
    </footer>
  );
}
