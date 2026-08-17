'use client';
import Link from 'next/link';

const DIRS = [
  { id: 'R', name: 'Refined', href: '/redesign/refined' },
  { id: 'A', name: 'Clarity', href: '/redesign/clarity' },
  { id: 'B', name: 'Momentum', href: '/redesign/momentum' },
  { id: 'C', name: 'Legacy', href: '/redesign/legacy' },
];

export default function RedesignBar({ current }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white/90 px-2 py-1.5 shadow-lg backdrop-blur">
      <Link href="/redesign" className="px-3 py-1 font-sans text-xs font-medium text-neutral-500 hover:text-neutral-900">Directions</Link>
      {DIRS.map((d) => (
        <Link key={d.id} href={d.href}
          className={`rounded-full px-3 py-1 font-sans text-xs font-semibold ${current === d.id ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>
          {d.name}
        </Link>
      ))}
    </div>
  );
}
