/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ancient Indian Heritage Palette
        parchment: {
          light: '#fbf8f1',
          DEFAULT: '#f5efe1',
          dark: '#ede5d5',
          aged: '#dfd4be',
          deep: '#cbbda3',
        },
        terracotta: {
          light: '#c2410c',
          DEFAULT: '#9a3412',
          deep: '#7c2d12',
          dark: '#431407',
        },
        vedic: {
          gold: '#d97706',
          'gold-bright': '#f59e0b',
          'gold-light': '#fbbf24',
          'gold-shimmer': '#fef3c7',
          'gold-antique': '#b45309',
          vermilion: '#b91c1c',
          'vermilion-bright': '#dc2626',
          'vermilion-dark': '#991b1b',
          copper: '#ea580c',
          tulsi: '#15803d',
          'tulsi-bright': '#22c55e',
          lotus: '#be185d',
          indigo: '#1e1b4b',
        },
        temple: {
          obsidian: '#0a0c14',
          night: '#0f111a',
          stone: '#181b26',
          surface: '#222636',
          border: '#373c52',
          goldBorder: 'rgba(217, 119, 6, 0.45)',
        }
      },
      fontFamily: {
        epic: ['"Cinzel Decorative"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        devanagari: ['"Yatra One"', '"Noto Serif Devanagari"', 'serif'],
        sanskrit: ['"Rozha One"', '"Noto Serif Devanagari"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        body: ['"Noto Serif Devanagari"', 'serif'],
      },
      boxShadow: {
        'vedic-gold': '0 0 20px rgba(217, 119, 6, 0.45), 0 0 45px rgba(245, 158, 11, 0.2)',
        'vedic-vermilion': '0 0 20px rgba(185, 28, 28, 0.45), 0 0 40px rgba(220, 38, 38, 0.2)',
        'diya': '0 0 25px rgba(245, 158, 11, 0.55), inset 0 0 15px rgba(245, 158, 11, 0.25)',
        'parchment': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(217, 119, 6, 0.2)',
      },
      animation: {
        'diya-flicker': 'diyaFlicker 3s ease-in-out infinite',
        'mandala-spin': 'mandalaSpin 30s linear infinite',
        'mandala-spin-reverse': 'mandalaSpinReverse 25s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 2s ease-in-out infinite',
      },
      keyframes: {
        diyaFlicker: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '25%': { opacity: '0.88', filter: 'brightness(0.95)' },
          '50%': { opacity: '0.96', filter: 'brightness(1.08)' },
          '75%': { opacity: '0.92', filter: 'brightness(1.02)' },
        },
        mandalaSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        mandalaSpinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        goldShimmer: {
          '0%, 100%': { borderColor: 'rgba(217, 119, 6, 0.4)' },
          '50%': { borderColor: 'rgba(251, 191, 36, 0.9)' },
        }
      }
    },
  },
  plugins: [],
};
