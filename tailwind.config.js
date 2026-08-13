/** Token layer — values sourced from design-analysis/design-language.md. No hard-coded values in components. */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#0B0D0F', 800: '#14181C', 700: '#1C2127' },
        slate: { 700: '#2A2F36', 600: '#3A4048' },
        stone: { 500: '#6B6B70', 400: '#8A8A8E', 300: '#B7B7BB' },
        sky: { 200: '#DCE6F0', 100: '#EDF2F8' },
        paper: { 50: '#F6F4F1', 100: '#EFEBE6' },
        accent: { DEFAULT: '#D81F2A', ink: '#A31620', soft: '#E85761' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-mono)', 'Space Mono', 'monospace'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
        lexend: ['var(--font-lexend)', 'sans-serif'],
        fraunces: ['var(--font-fraunces)', 'serif'],
      },
      fontSize: {
        // rem scale extracted from reference CSS
        'display-mega': ['20rem', { lineHeight: '0.82', letterSpacing: '-0.04em' }],
        'display-1': ['clamp(3rem, 9vw, 8.75rem)', { lineHeight: '0.92', letterSpacing: '-0.035em' }],
        'display-2': ['clamp(2.5rem, 7vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-3': ['clamp(2rem, 5vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'h1': ['clamp(2rem, 4vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h2': ['clamp(1.75rem, 3vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'h3': ['clamp(1.5rem, 2.2vw, 2.5rem)', { lineHeight: '1.15' }],
        'h4': ['2rem', { lineHeight: '1.2' }],
        'title': ['1.5rem', { lineHeight: '1.25' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.16em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.2em' }],
      },
      spacing: { 'chapter': '10rem', 'chapter-sm': '8.25rem' },
      maxWidth: { container: '72rem', prose: '38rem' },
      borderRadius: { xs: '6px', sm: '10px' },
      transitionTimingFunction: {
        settle: 'cubic-bezier(0.2, 0, 0, 1)',      // signature expo-out
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        decel: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: { settle: '900ms' },
      letterSpacing: { tightest: '-0.04em', tighter: '-0.02em', label: '0.16em', wide: '0.24em' },
    },
  },
  plugins: [],
};
