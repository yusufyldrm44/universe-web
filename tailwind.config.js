/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A3C5E',
          dark: '#0F2942',
          light: '#2E5A82',
        },
        accent: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['"Source Serif Pro"', 'Georgia', 'Cambria', 'serif'],
      },
      backgroundImage: {
        'gradient-mesh':
          'radial-gradient(at 18% 20%, rgba(59, 130, 246, 0.18) 0px, transparent 50%), radial-gradient(at 82% 12%, rgba(46, 90, 130, 0.20) 0px, transparent 55%), radial-gradient(at 50% 90%, rgba(26, 60, 94, 0.22) 0px, transparent 60%), radial-gradient(at 88% 80%, rgba(219, 234, 254, 0.35) 0px, transparent 55%)',
        'gradient-primary':
          'linear-gradient(135deg, #0F2942 0%, #1A3C5E 50%, #2E5A82 100%)',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15, 41, 66, 0.04), 0 1px 3px 0 rgba(15, 41, 66, 0.06)',
        glow: '0 10px 30px -10px rgba(26, 60, 94, 0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blob-float': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -25px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.97)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'blob-float': 'blob-float 14s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        marquee: 'marquee 45s linear infinite',
      },
    },
  },
  plugins: [],
}
