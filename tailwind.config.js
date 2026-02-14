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
        snakeEntry: 'snakeEntry 1.4s ease-out forwards',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(2deg)' },
        },
        snakeEntry: {
          '0%': { transform: 'scale(0.3) rotate(0deg)', opacity: '0' },
          '20%': { transform: 'scale(1.12) rotate(-4deg)', opacity: '1' },
          '35%': { transform: 'scale(1) rotate(3deg)', opacity: '1' },
          '50%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
          '65%': { transform: 'scale(1) rotate(2deg)', opacity: '1' },
          '80%': { transform: 'scale(1) rotate(-1deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
