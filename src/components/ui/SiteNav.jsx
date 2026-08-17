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

// Cinematic brand nav — transparent over the hero, frosts to glass on scroll.
export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-[cubic-bezier(.2,0,0,1)] ${scrolled || open ? 'tile-strong' : 'bg-gradient-to-b from-black/55 to-transparent'}`}>
      <div className="u-container flex h-[84px] items-center justify-between md:h-[100px]">
        <Link href="/" className="flex items-center" aria-label="DMF Engineering home">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-14 w-auto brightness-0 invert md:h-[68px]" />
        </Link>
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}
                className={`u-link-underline font-raleway text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${active ? 'text-brand-red' : 'text-white/85 hover:text-white'}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-5">
          <Link href="/contact" className="hidden rounded-full bg-brand-red px-6 py-3 font-raleway text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-all hover:bg-brand-red-deep sm:inline-block">
            Start a project
          </Link>
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            <span className="font-raleway text-[12px] font-semibold uppercase tracking-[0.18em] text-white">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
      <div className={`fixed inset-0 -z-10 flex flex-col justify-center gap-1 bg-brand-coal px-8 transition-all duration-500 ease-[cubic-bezier(.2,0,0,1)] lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none invisible opacity-0'}`}>
        {[{ label: 'Home', href: '/' }, ...LINKS, { label: 'Contact', href: '/contact' }].map((l) => (
          <Link key={l.href} href={l.href} className="r-h text-4xl text-white hover:text-brand-red">{l.label}</Link>
        ))}
      </div>
    </header>
  );
}
