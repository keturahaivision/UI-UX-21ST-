'use client';
import Link from 'next/link';
import Chapter from './Chapter';
import Reveal from '@/components/motion/Reveal';

export default function ChapterBegin() {
  return (
    <Chapter id="begin" index={6} label="Begin" tone="light">
      <div className="u-container flex min-h-screen flex-col items-start justify-center py-32">
        <Reveal as="p" className="u-label text-accent-soft">The ethos</Reveal>
        <Reveal as="blockquote" className="mt-8 max-w-4xl font-display text-display-2 text-ink-900">
          Innovation, expertise, and dedication converge to redefine excellence.
        </Reveal>
        <Reveal as="div" className="mt-12 flex flex-wrap items-center gap-6">
          <Link href="/contact" className="rounded-sm bg-accent px-8 py-4 font-mono text-label uppercase text-paper-50 transition-colors duration-500 ease-settle hover:bg-accent-ink">
            Start a project
          </Link>
          <Link href="/projects" className="u-label u-link-underline text-ink-900">Explore the work →</Link>
        </Reveal>
      </div>
    </Chapter>
  );
}
