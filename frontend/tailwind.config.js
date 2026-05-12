/** @type {import('tailwindcss').Config}
 * Tokens: surface #181818, primary #4aae8c, secondary #f75256, accent #fed734, highlight #ffffff.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        /** design.mdc §1 — semantic roles */
        primary: '#4aae8c',
        secondary: '#f75256',
        accent: '#fed734',
        highlight: '#ffffff',
        surface: '#181818'
      }
    }
  },
  plugins: []
}
