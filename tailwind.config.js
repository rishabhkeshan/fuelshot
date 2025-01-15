import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fuel: {
          green: '#00FFA3',
          dark: {
            900: '#000000',
            800: '#111111',
            700: '#1A1A1A',
            600: '#222222'
          }
        }
      },
    },
  },
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
  ],
}