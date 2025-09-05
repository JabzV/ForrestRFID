/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb',
        primary1: '#023f26',
        success: '#54b14e',
        'success-light': '#bffdb5',
        'success-lightest': '#e5ffe1',
        'success-dark': '#40803a',
        'success-active': '#467a46',
        warning: '#da7010',
        'warning-light': '#ffebd5',
        'warning-dark': '#b35400',
        danger: '#ed3535',
        'danger-light': '#ffdede',
        'danger-dark': '#b32626',
      },
    },
  },
  plugins: [],
}
