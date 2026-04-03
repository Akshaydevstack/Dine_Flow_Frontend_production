/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      // Keep your beautiful script font for logos and accents
      brand: ["Dancing Script", "cursive"], 
      
      // 🚀 Consolidate all UI text to Inter for maximum performance!
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"], 
    },
    extend: {
      colors: {
        primary: "var(--color-primary)",
        primaryHover: "var(--color-primary-hover)",
        secondary: "var(--color-secondary)",
        bg: "var(--color-bg)",
        card: "var(--color-bg-card)",
        text: "var(--color-text)",
      } 
    },
  },
  plugins: [],
};