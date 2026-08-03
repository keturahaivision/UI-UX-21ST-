import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="u-container flex min-h-screen flex-col items-center justify-center text-center">
      <p className="font-mono text-display-2 text-accent">404</p>
      <h1 className="mt-4 font-display text-h2 text-paper-50">This ground is undeveloped.</h1>
      <Link href="/" className="mt-8 u-label u-link-underline text-paper-50">Return home →</Link>
    </div>
  );
}
