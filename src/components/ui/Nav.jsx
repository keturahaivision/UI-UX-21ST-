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
  { label: 'Contact', href: '/contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-standard ${scrolled || open ? 'glass-strong' : 'bg-gradient-to-b from-ink-900/50 to-transparent'}`}>
      <div className="u-container flex h-20 items-center justify-between md:h-24">
        <Link href="/" className="flex items-center gap-3" aria-label="DMF Engineering home">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-11 w-auto md:h-14" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`u-link-underline font-mono text-label uppercase transition-colors ${pathname.startsWith(l.href) ? 'text-accent' : 'text-paper-50/80 hover:text-paper-50'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          <span className="u-label text-paper-50">{open ? 'CLOSE' : 'MENU'}</span>
        </button>
      </div>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 -z-10 flex flex-col justify-center gap-2 glass-strong px-8 transition-all duration-500 ease-settle md:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        {[{ label: 'Home', href: '/' }, ...LINKS].map((l) => (
          <Link key={l.href} href={l.href} className="font-display text-h2 text-paper-50 hover:text-accent">{l.label}</Link>
        ))}
      </div>
    </header>
  );
}
