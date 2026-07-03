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
        myntra: {
          pink: '#ff3f6c',
          dark: '#282c3f',
          gray: '#9496a2',
          light: '#f5f5f6',
          yellow: '#f4c430',
        }
      },
      fontFamily: {
        sans: ['Assistant', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'myntra': '0 4px 12px 0 rgba(0,0,0,0.05)',
        'myntra-hover': '0 8px 20px 0 rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
