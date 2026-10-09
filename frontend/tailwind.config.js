/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#F3ECD9",
          dark: "#E7DBBB",
        },
        ink: {
          DEFAULT: "#1F1A12",
          soft: "#2B2417",
          muted: "#B9AC8E",
        },
        gold: {
          DEFAULT: "#C89B3C",
          light: "#E4C878",
        },
        crimson: "#8C2A2E",
        moss: "#47623B",
        sun: "#E1642A",
        plum: { DEFAULT: "#6B4A86", light: "#BBA0D6" },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        assamese: ["'Noto Serif Bengali'", "serif"],
        eagle: ["'Eagle Lake'", "cursive"],
        devanagari: ["'Noto Sans Devanagari'", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        "draw-line": {
          from: { strokeDashoffset: "var(--dash-length, 400)" },
          to: { strokeDashoffset: "0" },
        },
        "rise-fade": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sun-rise": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.94)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "draw-line": "draw-line 1.4s ease-out forwards",
        "rise-fade": "rise-fade 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "sun-rise": "sun-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
