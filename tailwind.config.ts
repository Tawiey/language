import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Fixed accent palette (same in both themes)
        cream: "#F7EFE2",
        sand: "#EDE0CC",
        ochre: "#C8821E",
        sun: "#E8A23D",
        clay: "#A8531E",
        cocoa: "#6B3E1D",
        bark: "#3E2615",
        leaf: "#5E7A4B",
        berry: "#9B3B2E",
        // Theme-aware semantic tokens (flip via CSS variables)
        ink: "rgb(var(--ink) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        field: "rgb(var(--field) / <alpha-value>)",
        hair: "rgb(var(--hair) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 20px -6px rgba(62, 38, 21, 0.25)",
        pop: "0 2px 0 0 rgba(62, 38, 21, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
