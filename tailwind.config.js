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
        'fuel-green': 'rgb(0, 201, 167)',
        'fuel-dark': {
          600: 'rgb(45, 45, 45)',
          700: 'rgb(38, 38, 38)',
          800: 'rgb(26, 26, 26)',
        },
      },
    },
  },
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
  ],
}