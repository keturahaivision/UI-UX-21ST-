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

// Light-direction display faces (redesign prototypes)
export const poppins = localFont({
  src: [
    { path: './fonts/Poppins-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Poppins-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-poppins', display: 'swap', fallback: ['sans-serif'],
});
export const lexend = localFont({
  src: [
    { path: './fonts/Lexend-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Lexend-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-lexend', display: 'swap', fallback: ['sans-serif'],
});
export const fraunces = localFont({
  src: [
    { path: './fonts/Fraunces-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Fraunces-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-fraunces', display: 'swap', fallback: ['serif'],
});
// Brand faces from the original dmfeng.com — Raleway (display, variable) + PT Sans (body).
export const raleway = localFont({
  src: [{ path: './fonts/Raleway-400.woff2', weight: '400 800', style: 'normal' }],
  variable: '--font-raleway', display: 'swap', fallback: ['system-ui', 'sans-serif'],
});
export const ptsans = localFont({
  src: [
    { path: './fonts/PTSans-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/PTSans-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-ptsans', display: 'swap', fallback: ['system-ui', 'sans-serif'],
});
