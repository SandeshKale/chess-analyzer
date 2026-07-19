/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#1C1F26",
        graphite2: "#252932",
        ivory: "#EDE6D6",
        ivorydim: "#B8B2A4",
        brass: "#B8956A",
        brassdim: "#8A7256",
        sage: "#6E8F71",
        oxblood: "#8C3A3A",
        amberdull: "#B08B3F",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
