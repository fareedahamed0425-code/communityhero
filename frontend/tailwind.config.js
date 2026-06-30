/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // Teal 700
          light: '#14B8A6', // Teal 500
          dark: '#042F2E', // Teal 900
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber 500
        }
      }
    },
  },
  plugins: [],
}
