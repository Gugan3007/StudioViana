import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "rgb(var(--forest-rgb) / <alpha-value>)",
        "forest-deep": "rgb(var(--forest-deep-rgb) / <alpha-value>)",
        cream: "rgb(var(--cream-rgb) / <alpha-value>)",
        "cream-soft": "rgb(var(--cream-soft-rgb) / <alpha-value>)",
        gold: "rgb(var(--gold-rgb) / <alpha-value>)",
        "gold-light": "rgb(var(--gold-light-rgb) / <alpha-value>)",
        charcoal: "rgb(var(--charcoal-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        blush: "rgb(var(--blush-rgb) / <alpha-value>)",
        lilac: "rgb(var(--lilac-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-lora)", "Georgia", "serif"],
        body: ["var(--font-poppins)", "Arial", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(3rem, 7vw, 6.5rem)", { lineHeight: "0.98" }],
        h1: ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "1.05" }],
        h2: ["clamp(2rem, 3.5vw, 3.25rem)", { lineHeight: "1.12" }],
        h3: ["clamp(1.4rem, 2vw, 1.9rem)", { lineHeight: "1.2" }],
        body: ["clamp(0.95rem, 1vw, 1.05rem)", { lineHeight: "1.8" }],
        label: ["0.72rem", { lineHeight: "1.4" }],
      },
      letterSpacing: {
        label: "0.35em",
      },
      maxWidth: {
        content: "82.5rem",
      },
      spacing: {
        section: "clamp(6rem, 12vw, 11rem)",
        gutter: "clamp(1.25rem, 4vw, 3rem)",
      },
      borderRadius: {
        editorial: "2px",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(22, 36, 27, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
