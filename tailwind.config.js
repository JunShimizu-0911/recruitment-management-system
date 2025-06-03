/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#000000',
        primary: '#000000',
      },
      opacity: {
        '85': '0.85',
      }
    },
  },
  plugins: [],
};
