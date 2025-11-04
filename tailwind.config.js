/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./src/**/*.{html,ts}",
  ],
    theme: {
    extend: {
      colors: {
        'neon-blue': '#00d4ff', // Custom color
      },
      boxShadow: {
        // Custom shadow for the neon glow effect
        'neon': '0 0 10px rgba(0, 212, 255, 0.7)',
        'neon-lg': '0 0 20px rgba(0, 212, 255, 0.9)',
      },
      keyframes: {
        // Custom keyframe for the shimmer animation on the glow-line
        shimmer: {
          '0%': { 'background-position': '-100% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        'blob-bounce-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20%, -30%) scale(1.1)' },
          '50%': { transform: 'translate(40%, 10%) scale(0.9)' },
          '75%': { transform: 'translate(-10%, 20%) scale(1.05)' },
        },
        'blob-bounce-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-30%, 10%) scale(0.95)' },
          '50%': { transform: 'translate(10%, 30%) scale(1.1)' },
          '75%': { transform: 'translate(20%, -20%) scale(1)' },
        },
        'blob-bounce-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(15%, 25%) scale(1.05)' },
          '50%': { transform: 'translate(-20%, -10%) scale(0.9)' },
          '75%': { transform: 'translate(5%, -30%) scale(1.1)' },
        },
        'blob-bounce-4': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-25%, -15%) scale(1.1)' },
          '50%': { transform: 'translate(10%, 20%) scale(0.95)' },
          '75%': { transform: 'translate(30%, -5%) scale(1)' },
        },
        'blob-bounce-5': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(5%, -20%) scale(0.9)' },
          '50%': { transform: 'translate(-15%, 10%) scale(1.05)' },
          '75%': { transform: 'translate(20%, 25%) scale(1.1)' },
        },
        'blob-bounce-6': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-10%, 20%) scale(1.1)' },
          '50%': { transform: 'translate(25%, -15%) scale(0.9)' },
          '75%': { transform: 'translate(-5%, -30%) scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'blob-bounce-1': 'blob-bounce-1 15s ease-in-out infinite alternate',
        'blob-bounce-2': 'blob-bounce-2 18s ease-in-out infinite alternate',
        'blob-bounce-3': 'blob-bounce-3 14s ease-in-out infinite alternate',
        'blob-bounce-4': 'blob-bounce-4 17s ease-in-out infinite alternate',
        'blob-bounce-5': 'blob-bounce-5 16s ease-in-out infinite alternate',
        'blob-bounce-6': 'blob-bounce-6 19s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}


