'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';

const LINKS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
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
    <header className={`fixed inset-x-0 top-0 z-[90] transition-colors duration-500 ease-standard ${scrolled || open ? 'bg-ink-900/85 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="u-container flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-3" aria-label="DMF Engineering home">
          <img src={asset('/dmf-logo.png')} alt="DMF Engineering" className="h-7 w-auto md:h-8" />
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
      <div className={`fixed inset-0 -z-10 flex flex-col justify-center gap-2 bg-ink-900 px-8 transition-all duration-500 ease-settle md:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        {[{ label: 'Home', href: '/' }, ...LINKS].map((l) => (
          <Link key={l.href} href={l.href} className="font-display text-h2 text-paper-50 hover:text-accent">{l.label}</Link>
        ))}
      </div>
    </header>
  );
}
