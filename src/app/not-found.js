import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="u-container flex min-h-screen flex-col items-center justify-center text-center">
      <p className="font-fraunces text-7xl font-medium text-dmf-red md:text-8xl">404</p>
      <h1 className="mt-4 font-fraunces text-3xl font-medium text-dmf-ink md:text-4xl">This ground is undeveloped.</h1>
      <Link href="/" className="mt-8 text-sm font-semibold text-dmf-red underline underline-offset-4">Return home →</Link>
    </div>
  );
}
