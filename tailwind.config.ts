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
        // Instagram-like neutrals
        cream: {
          50: '#FAFAFA',   // Instagram bg
          100: '#F5F5F5',
          200: '#EFEFEF',  // Instagram border
        },
        // Modern vibrant green brand
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
        },
        sage: {
          100: '#DCFCE7',
          400: '#4ADE80',
          500: '#22C55E',
        },
        // Social accent colors
        like: '#EF4444',
        link: '#16A34A',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pop': 'pop 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'nav': '0 -1px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
