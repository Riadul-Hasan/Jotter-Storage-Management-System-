import { fileURLToPath } from "node:url";

// Absolute, forward-slash base dir so `content` globs resolve regardless of
// which directory Vite/PostCSS was launched from (Tailwind resolves relative
// globs against process.cwd(), not this file).
const baseDir = fileURLToPath(new URL(".", import.meta.url)).replace(/\\/g, "/");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    `${baseDir}index.html`,
    `${baseDir}src/**/*.{js,ts,jsx,tsx}`,
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        dark: {
          900: '#020617',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
        },
        // Warm-white paper palette (light theme base)
        cream: {
          50: '#FFFDF8',
          100: '#FCF7EE',
          150: '#F9F1E5',
          200: '#F3E9DA',
          300: '#EADCC7',
          400: '#E0CDB2',
          500: '#CDB79A',
          600: '#B39C7F',
          700: '#948066',
          800: '#6F6049',
          900: '#4A4133',
        },
        // Warm ink (text) scale — never pure black/grey
        ink: {
          900: '#2A2117',
          800: '#3B3125',
          700: '#554A3B',
          600: '#786B5A',
          500: '#9B8E7B',
          400: '#BCB0A0',
        },
        // Brand accents for the colourful light UI
        brand: {
          coral: '#FF6B5B',
          tangerine: '#FF9F1C',
          sun: '#FACC15',
          mint: '#12B886',
          sky: '#3BA3FF',
          grape: '#8B5CF6',
          rose: '#F43F5E',
        },
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          pink: '#ec4899',
          orange: '#f97316',
          green: '#22c55e',
        },
        glass: {
          bg: 'rgba(15, 23, 42, 0.7)',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'premium': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        // Soft, warm-tinted shadows for the light UI
        'warm-xs': '0 1px 2px rgba(96, 76, 46, 0.06), 0 1px 3px rgba(96, 76, 46, 0.05)',
        'warm-sm': '0 2px 6px rgba(96, 76, 46, 0.07), 0 6px 16px rgba(96, 76, 46, 0.06)',
        'warm-md': '0 6px 16px rgba(96, 76, 46, 0.08), 0 14px 34px rgba(96, 76, 46, 0.09)',
        'warm-lg': '0 14px 32px rgba(96, 76, 46, 0.10), 0 30px 60px rgba(96, 76, 46, 0.12)',
        'warm-xl': '0 24px 48px rgba(96, 76, 46, 0.13), 0 48px 96px rgba(96, 76, 46, 0.14)',
        'warm-glow': '0 8px 24px rgba(255, 107, 91, 0.22)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite linear',
        'morph': 'morph 8s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'blob-drift': 'blobDrift 18s ease-in-out infinite',
        'blob-drift-slow': 'blobDrift 26s ease-in-out infinite reverse',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'skeleton': 'skeleton 1.6s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 211, 238, 0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
          '33%': { borderRadius: '50% 60% 30% 70% / 50% 60% 30% 60%' },
          '66%': { borderRadius: '30% 50% 50% 60% / 60% 40% 50% 50%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blobDrift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(40px, -50px, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-30px, 30px, 0) scale(0.94)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        skeleton: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-mesh': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
        'gradient-neon': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
    },
  },
  plugins: [],
}
