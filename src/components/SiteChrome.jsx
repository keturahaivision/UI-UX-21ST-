'use client';
import { usePathname } from 'next/navigation';
import SmoothScroll from '@/components/motion/SmoothScroll';
import Preloader from '@/components/ui/Preloader';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import FloatingCTA from '@/components/ui/FloatingCTA';

// Redesign-prototype routes render their own light chrome, so suppress the
// production dark nav/preloader/footer/CTA there.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/redesign');
  if (bare) return <SmoothScroll>{children}</SmoothScroll>;
  return (
    <>
      <Preloader />
      <SmoothScroll>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <FloatingCTA />
      </SmoothScroll>
    </>
  );
}
