import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Legacy kept for compat ──────────────────────
        cream: { 50: '#FAFAF9', 100: '#F5F5F0', 200: '#EEEEE8' },
        forest: {
          50: '#F2F7F4', 100: '#E1EDE6', 200: '#BDD5C6', 300: '#90B9A0',
          400: '#5E9877', 500: '#3D7A5A', 600: '#2A6145', 700: '#1E4D35',
          800: '#133426', 900: '#0A1F16',
        },
        sage: { 100: '#E1EDE6', 400: '#5E9877', 500: '#3D7A5A' },

        // ── Dark theme backgrounds ──────────────────────
        night: {
          950: '#040A06',
          900: '#070E09',
          800: '#0C1610',
          750: '#0F1C13',
          700: '#131F17',
          600: '#192819',
          500: '#1F321E',
          400: '#273F26',
          300: '#2F4E2E',
          200: '#3D6640',
          100: '#527A55',
        },
        // ── Eco vivid green (CTAs & accents) ────────────
        eco: {
          50:  '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0',
          300: '#86EFAC', 400: '#4ADE80', 500: '#22C55E',
          600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D',
        },
        like: '#F87171',
        link: '#4ADE80',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out both',
        'fade-in-fast': 'fadeIn 0.2s ease-out both',
        'slide-up':     'slideUp 0.4s ease-out both',
        'slide-up-sm':  'slideUpSm 0.3s ease-out both',
        'pop':          'pop 0.25s ease-out',
        'shimmer':      'shimmer 1.6s infinite',
        'float':        'float 6s ease-in-out infinite',
        'scale-in':     'scaleIn 0.2s ease-out both',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUpSm: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pop:       { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' }, '100%': { transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        glowPulse: { '0%, 100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        card:        '0 1px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.08)',
        nav:         '0 -1px 0 rgba(255,255,255,0.04)',
        dropdown:    '0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
        modal:       '0 24px 64px rgba(0,0,0,0.7)',
        'eco-glow':  '0 0 24px rgba(34,197,94,0.18), 0 0 48px rgba(34,197,94,0.06)',
        'eco-sm':    '0 0 12px rgba(34,197,94,0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
