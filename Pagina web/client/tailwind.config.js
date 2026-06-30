/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F3EC',
        'cream-dark': '#EAE7DC',
        'cream-darker': '#DDD9CF',
        ink: '#1A1A1A',
        'ink-light': '#4A4A4A',
        'ink-muted': '#8A8A8A',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
    },
  },
  plugins: [],
}
