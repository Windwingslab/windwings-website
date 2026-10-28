/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#0C0C0C', silver: '#D7E2EA' },
      fontFamily: { sans: ['Kanit', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'] },
    },
  },
  plugins: [],
}
