/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8eb',
          100: '#f9ecc8',
          200: '#f3d98f',
          300: '#e8c45a',
          400: '#d4ad3a',
          500: '#C9A84C',
          600: '#b8942a',
          700: '#9a7a1f',
          800: '#7d6218',
          900: '#5e4a12',
        },
        crimson: {
          50: '#fdf2f2',
          100: '#f5d0d0',
          200: '#e8a0a0',
          300: '#c46060',
          400: '#a83a3a',
          500: '#8B1A1A',
          600: '#761616',
          700: '#611212',
          800: '#4c0e0e',
          900: '#3a0a0a',
        },
        charcoal: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#333333',
          600: '#2b2b2b',
          700: '#222222',
          800: '#1a1a1a',
          900: '#111111',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
