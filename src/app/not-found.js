import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="u-container flex min-h-screen flex-col items-center justify-center text-center">
      <p className="font-raleway text-7xl font-medium text-brand-red md:text-8xl">404</p>
      <h1 className="mt-4 font-raleway text-3xl font-medium text-white md:text-4xl">This ground is undeveloped.</h1>
      <Link href="/" className="mt-8 text-sm font-semibold text-brand-red underline underline-offset-4">Return home →</Link>
    </div>
  );
}
