/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#10b981',
        'brand-green-light': '#d1fae5',
        'brand-gray': '#6b7280',
        'brand-light': '#f9fafb',
      },
    },
  },
  plugins: [],
}