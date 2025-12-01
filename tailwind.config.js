/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'supabase-dark': '#1c1c1c',
        'supabase-green': '#3ecf8e',
        'supabase-bg': '#121212',
      }
    },
  },
  plugins: [],
}
