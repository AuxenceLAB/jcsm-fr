/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './zones/*.html',
    './blog/*.html',
    './blog.html',
    './js/**/*.js'
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#1D4ED8',
      }
    }
  },
  plugins: [],
}
