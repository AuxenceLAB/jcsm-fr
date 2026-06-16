/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './zones/*.html',
    './solutions/*.html',
    './blog/*.html',
    './en/*.html',
    './de/*.html',
    './es/*.html',
    './it/*.html',
    './nl/*.html',
    './pl/*.html',
    './pt/*.html',
    './js/**/*.js'
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#1D4ED8',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      }
    }
  },
  plugins: [],
}
