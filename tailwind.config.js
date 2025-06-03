/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#1F2937',
        cream: '#E5E7EB',
      },
      opacity: {
        '85': '0.85',
      }
    },
  },
  plugins: [],
};
