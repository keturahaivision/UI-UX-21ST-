import Link from 'next/link';

export const metadata = { title: 'Redesign directions · DMF', robots: { index: false } };

const DIRS = [
  { id: 'R', name: 'Refined', href: '/redesign/refined', tag: 'Recommended',
    desc: 'The synthesis: clean off-white base, editorial Fraunces headlines, red accent and big imagery. Clarity’s polish + Legacy’s sophistication — premium and direct.' },
  { id: 'A', name: 'Clarity', href: '/redesign/clarity', tag: 'Clean corporate',
    desc: 'White, imagery-led, generous whitespace. Lexend + red accent. Jacobs-style confidence — polished and direct.' },
  { id: 'B', name: 'Momentum', href: '/redesign/momentum', tag: 'Bold modern',
    desc: 'Warm tint, oversized rounded Poppins type, red + ink colour blocks. TRC-style energy — distinctive and current.' },
  { id: 'C', name: 'Legacy', href: '/redesign/legacy', tag: 'Editorial premium',
    desc: 'Warm neutral, Fraunces serif, navy + oxblood. An established-firm feel — sophisticated and timeless.' },
];

export default function RedesignIndex() {
  return (
    <div className="min-h-screen bg-white font-lexend text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Redesign · light directions</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">Four lighter, more premium directions.</h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-600">
          Each is a live prototype built with DMF’s real content and imagery — lighter, cleaner and more premium, inspired by TRC and Jacobs. Pick one and I’ll rebuild the full site in it.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DIRS.map((d) => (
            <Link key={d.id} href={d.href} className="group rounded-2xl border border-neutral-200 p-8 transition-shadow hover:shadow-xl">
              <div className="flex items-baseline justify-between">
                <span className="text-5xl font-bold text-neutral-900">{d.id}</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">{d.tag}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold">{d.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{d.desc}</p>
              <span className="mt-6 inline-block text-sm font-semibold text-red-600">View prototype →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
