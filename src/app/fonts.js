import localFont from 'next/font/local';

export const display = localFont({
  src: [
    { path: './fonts/SpaceGrotesk-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/SpaceGrotesk-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/SpaceGrotesk-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display', display: 'swap', fallback: ['sans-serif'],
});
export const mono = localFont({
  src: [
    { path: './fonts/SpaceMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/SpaceMono-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-mono', display: 'swap', fallback: ['monospace'],
});
export const body = localFont({
  src: [
    { path: './fonts/Inter-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Inter-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Inter-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-body', display: 'swap', fallback: ['system-ui', 'sans-serif'],
});
