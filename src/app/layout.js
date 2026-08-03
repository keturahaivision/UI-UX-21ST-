import './globals.css';
import { display, mono, body } from './fonts';
import { pageMeta, orgJsonLd } from '@/lib/seo';
import SmoothScroll from '@/components/motion/SmoothScroll';
import Preloader from '@/components/ui/Preloader';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import FloatingCTA from '@/components/ui/FloatingCTA';

export const metadata = {
  metadataBase: new URL('https://dmfeng.com'),
  ...pageMeta({}),
};
export const viewport = { themeColor: '#0B0D0F', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
        <Preloader />
        <SmoothScroll>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <FloatingCTA />
        </SmoothScroll>
      </body>
    </html>
  );
}
