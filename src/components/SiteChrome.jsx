'use client';
import { usePathname } from 'next/navigation';
import SmoothScroll from '@/components/motion/SmoothScroll';
import SiteNav from '@/components/ui/SiteNav';
import SiteFooter from '@/components/ui/SiteFooter';

// Redesign-prototype routes render their own chrome, so suppress the shared
// nav/footer there.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/redesign');
  if (bare) return <SmoothScroll>{children}</SmoothScroll>;
  return (
    <SmoothScroll>
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
    </SmoothScroll>
  );
}
