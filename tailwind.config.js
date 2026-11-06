/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#050816',
          900: '#080b18',
          800: '#0b1020',
          700: '#101a2f',
          accent: '#22d3ee',
          violet: '#8b5cf6',
          blue: '#60a5fa',
          silver: '#e2e8f0',
          muted: '#94a3b8',
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(34, 211, 238, 0.35)',
      },
    },
  },
  plugins: [],
};
