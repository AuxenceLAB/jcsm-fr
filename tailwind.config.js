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
        primary: '#205BC4',
        secondary: '#19499F',
        // Bleu de marque JCSM : les utilitaires blue-* ne ressortent plus le bleu Tailwind #2563EB.
        blue: { 50: '#EAF1FF', 100: '#EAF1FF', 500: '#205BC4', 600: '#205BC4', 700: '#19499F', 800: '#153C80', 900: '#153C80' },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      }
    }
  },
  plugins: [],
}
