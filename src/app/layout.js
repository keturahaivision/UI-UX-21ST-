import './globals.css';
import { display, mono, body, poppins, lexend, fraunces } from './fonts';
import { pageMeta, orgJsonLd } from '@/lib/seo';
import SiteChrome from '@/components/SiteChrome';

export const metadata = {
  metadataBase: new URL('https://dmfeng.com'),
  ...pageMeta({}),
};
export const viewport = { themeColor: '#0E0F12', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable} ${poppins.variable} ${lexend.variable} ${fraunces.variable}`}>
      <body className="font-body antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-label focus:uppercase focus:text-paper-50">Skip to content</a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
