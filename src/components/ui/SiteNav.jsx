'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';

const LINKS = [
  { label: 'Expertise', href: '/expertise' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Insights', href: '/insights' },
  { label: 'Careers', href: '/careers' },
];

// Systems Layer — transparent glass navigation over the dark ground.
export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-standard ${scrolled || open ? 'tile-strong' : 'bg-gradient-to-b from-sys-ground/85 to-transparent'}`}>
      <div className="u-container flex h-[74px] items-center justify-between md:h-[82px]">
        <Link href="/" className="flex items-center" aria-label="DMF Engineering home">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-11 w-auto brightness-0 invert md:h-12" />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}
                className={`u-link-underline font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${active ? 'text-sys-red' : 'text-sys-muted hover:text-sys-ink'}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="hidden rounded-full bg-sys-red px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-sys-red-deep sm:inline-block">
            Start a project
          </Link>
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-sys-ink">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 -z-10 flex flex-col justify-center gap-1 bg-sys-ground px-8 transition-all duration-500 ease-settle lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none invisible opacity-0'}`}>
        {[{ label: 'Home', href: '/' }, ...LINKS, { label: 'Contact', href: '/contact' }].map((l) => (
          <Link key={l.href} href={l.href} className="r-h text-4xl text-sys-ink hover:text-sys-red">{l.label}</Link>
        ))}
      </div>
    </header>
  );
}
