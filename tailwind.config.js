/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3faff',
          100: '#e1f0ff',
          600: '#0055aa',
          700: '#003d80',
          900: '#001d40',
        }
      }
    },
  },
  plugins: [],
}
