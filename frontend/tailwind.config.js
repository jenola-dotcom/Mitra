/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Vibrant farm palette: bright white base + leaf green, sunflower yellow, sky blue, warm earth.
        wheat: { 50: '#FFFCF0', 100: '#FFF3C9', 200: '#FFE699' },
        soil: {
          50: '#FBF7EE',
          100: '#E4D5B5',
          200: '#CDB98F',
          700: '#5B4630',
          800: '#43301D',
          900: '#2E2013',
        },
        leaf: {
          50: '#EBFBEC',
          100: '#C9F1CD',
          200: '#9BE3A5',
          500: '#22B04A',
          600: '#159A3A',
          700: '#0F7A2E',
        },
        clay: {
          50: '#FFF0E4',
          100: '#FFD9BC',
          500: '#E2682A',
          600: '#C2501A',
        },
        sky: {
          50: '#E5F5FF',
          100: '#C4E7FF',
          200: '#8FD2FA',
          500: '#1E9BE8',
          600: '#0A78C2',
        },
        sun: {
          50: '#FFF8D6',
          100: '#FFEB9A',
          400: '#FFC21A',
          500: '#E39A00',
        },
        alert: { 50: '#FFECEC', 500: '#E04848', 600: '#C42F2F' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', '"Inter"', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', '"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        sway: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        dot: { '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.4 }, '40%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        rise: 'rise .35s ease-out both',
        float: 'float 4s ease-in-out infinite',
        sway: 'sway 5s ease-in-out infinite',
        dot: 'dot 1.2s infinite ease-in-out',
      },
      boxShadow: {
        soft: '0 3px 0 rgba(21,154,58,0.10), 0 10px 24px -8px rgba(46,32,19,0.18)',
        card: '0 2px 0 rgba(205,185,143,0.55), 0 8px 18px -8px rgba(46,32,19,0.16)',
      },
    },
  },
  plugins: [],
}