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
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '25%': { transform: 'scale(1.08) rotate(-3deg)', opacity: '1' },
          '40%': { transform: 'scale(1) rotate(2deg)', opacity: '1' },
          '55%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
          '70%': { transform: 'scale(1) rotate(1deg)', opacity: '1' },
          '85%': { transform: 'scale(1) rotate(-0.5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
