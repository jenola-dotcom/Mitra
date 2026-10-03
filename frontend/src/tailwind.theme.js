// UI theme (palette: Main #0F766E, Secondary #22C55E, Accent #A3E635, Background #F8FAFC, Text #172033).
// Loaded from index.css via @config. Token names are kept so existing components pick up the new palette.
import path from 'node:path'

const glob = (p) => path.resolve(process.cwd(), p).replace(/\\/g, '/')

/** @type {import('tailwindcss').Config} */
export default {
  content: [glob('index.html'), glob('src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: {
        wheat: { 50: '#F8FAFC', 100: '#EEF6F4', 200: '#E0EEEA' },
        soil: { 50: '#F8FAFC', 100: '#DDE6EA', 200: '#C6D3DA', 700: '#3B4658', 800: '#243049', 900: '#172033' },
        leaf: { 50: '#F0FAF8', 100: '#D6F1EC', 500: '#22C55E', 600: '#0F766E', 700: '#0B5F59' },
        clay: { 50: '#F7FCE8', 100: '#ECF9C6', 500: '#A3E635', 600: '#4D7C0F' },
        sky: { 50: '#E8F5F3', 100: '#CFEAE6', 500: '#0F766E', 600: '#0B5F59' },
        sun: { 50: '#F7FCE8', 100: '#ECF9C6', 400: '#A3E635', 500: '#4D7C0F' },
        alert: { 50: '#FDF0F0', 500: '#C24343', 600: '#A73535' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', '"Inter"', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', '"Inter"', 'sans-serif'],
      },
      borderRadius: { xl2: '1rem' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        sway: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        dot: { '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.4 }, '40%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        rise: 'rise .35s ease-out both',
        sway: 'sway 5s ease-in-out infinite',
        dot: 'dot 1.2s infinite ease-in-out',
      },
      boxShadow: {
        soft: '0 2px 6px -1px rgba(23,32,51,0.06), 0 10px 24px -10px rgba(15,118,110,0.18)',
        card: '0 1px 2px rgba(23,32,51,0.05), 0 8px 20px -10px rgba(23,32,51,0.14)',
      },
    },
  },
  plugins: [],
}
