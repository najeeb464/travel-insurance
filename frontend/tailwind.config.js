/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emeraldBrand: {
          950: '#002E21',
          900: '#003D2B',
          850: '#004732',
          800: '#004D38',
          700: '#047857',
          650: '#00875A',
          600: '#00875A',
          500: '#10b981',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        midnight: {
          950: '#070B14',
          900: '#0B132B',
          850: '#0F172A',
          800: '#162032',
          700: '#1E293B',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#00875A',
          700: '#047857',
          800: '#004D38',
          900: '#003D2B',
          950: '#002E21',
        },
        cyanGlow: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        emeraldGlow: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        gold: {
          300: '#fde047',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'Instrument Serif', 'Georgia', 'serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        beam: {
          '0%': { opacity: '0.2', transform: 'translateX(-100%)' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '0.2', transform: 'translateX(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        beam: 'beam 3s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
      }
    },
  },
  plugins: [],
}
