/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        science: {
          physics: '#3b82f6',
          chem: '#10b981',
          math: '#8b5cf6',
          bio: '#06b6d4',
          ict: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
