'use client';
import Link from 'next/link';
export default function ConceptBar({ id, name, tone = 'dark' }) {
  const dark = tone === 'dark';
  return (
    <div className={`fixed left-0 right-0 top-0 z-[95] flex items-center justify-between px-6 py-3 font-mono text-label-sm ${dark ? 'bg-ink-900/80 text-paper-50' : 'bg-paper-50/85 text-ink-900'} backdrop-blur-md`}>
      <span><span className="text-accent">CONCEPT {id}</span> · {name}</span>
      <Link href="/concepts" className="u-link-underline">← all concepts</Link>
    </div>
  );
}
