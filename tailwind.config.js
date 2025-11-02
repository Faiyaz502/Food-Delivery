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
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}


