/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mint: '#E2FCD6',
        teal: '#14967F',
        deepblue: '#095D7E',
        skyblue: '#CCECEE',
        offwhite: '#F1F9FF',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        neo: '8px 8px 16px #a9c6c8, -8px -8px 16px #eefefe',
        'neo-inset': 'inset 6px 6px 12px #a9c6c8, inset -6px -6px 12px #eefefe',
        'neo-sm': '4px 4px 8px #a9c6c8, -4px -4px 8px #eefefe',
        'skeu-panel': 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.35), 0 6px 14px rgba(0,0,0,0.3)',
        'skeu-btn': '0 3px 0 #073f56, 0 6px 10px rgba(0,0,0,0.35)',
        'skeu-btn-active': '0 1px 0 #073f56, 0 2px 4px rgba(0,0,0,0.3)',
        glass: '0 8px 32px rgba(9,93,126,0.15)',
        'glow-teal': '0 0 20px rgba(20,150,127,0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(20,150,127,0.4)' },
          '50%': { boxShadow: '0 0 24px rgba(20,150,127,0.55)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out forwards',
        floatSlow: 'floatSlow 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};