/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1F2937',
        cream: '#FFFAF0',
      },
      opacity: {
        '85': '0.85',
      }
    },
  },
  plugins: [],
};
