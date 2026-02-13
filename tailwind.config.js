/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        wiggle: 'wiggle 0.6s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(-2deg)',
          },
          '75%': {
            transform: 'rotate(2deg)',
          },
        },
      },
    },
  },
  plugins: [],
};
