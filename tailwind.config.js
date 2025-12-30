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
          DEFAULT: '#38BDF8',
          dark: '#0284C7',
        },
        completed: '#9CA3AF',
        pomodoro: '#EF4444',
      },
    },
  },
  plugins: [],
}
