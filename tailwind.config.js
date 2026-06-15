/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        butter: {
          DEFAULT: '#ffefb3',
          light: '#fff9e3',
          dark: '#e6d38e',
        },
        darkgreen: {
          DEFAULT: '#013e37',
          light: '#0a5c52',
          dark: '#002420',
          muted: '#022e29',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
