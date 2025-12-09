/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./index.jsx",
    "./components/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#2D283E',
        'dark-card': '#4C495D',
        'dark-border': '#564F6F',
        'primary': '#802BB1',
        'primary-hover': '#6d2496',
        'text-light': '#D1D7E0',
      },
    },
  },
  plugins: [],
}
