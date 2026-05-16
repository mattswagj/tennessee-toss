import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8FAF6E",
          hover:   "#7a9a5a",
          50:  "#f3f8ee",
          100: "#e4f0d9",
          200: "#cae2b5",
          300: "#a9ce88",
          400: "#8FAF6E",
          500: "#7a9a5a",
          600: "#5f7a43",
          700: "#4b6035",
          800: "#3d4e2b",
          900: "#334124",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          50:  "#fdfcf9",
          100: "#F5F0E8",
          200: "#ebe1cc",
          300: "#dccfb0",
        },
        brown: {
          DEFAULT: "#6B4C2A",
          hover:   "#5a3e23",
          50:  "#f8f4ef",
          100: "#ede3d6",
          200: "#d9c5ad",
          300: "#c0a07d",
          400: "#a87d54",
          500: "#8f6340",
          600: "#6B4C2A",
          700: "#5a3e23",
          800: "#48301a",
          900: "#3a2614",
        },
      },
      fontFamily: {
        sans:   ["var(--font-geist-sans)", "Inter", "Arial", "sans-serif"],
        serif:  ["var(--font-playfair)", "Georgia", "serif"],
        script: ["var(--font-great-vibes)", "cursive"],
        mono:   ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        soft:    "0 4px 24px rgba(107,76,42,0.08)",
        "soft-lg": "0 8px 40px rgba(107,76,42,0.12)",
        "green-glow": "0 0 32px rgba(143,175,110,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
      },
      animation: {
        "fade-up":         "fade-up 0.5s ease-out forwards",
        "fade-up-delay-1": "fade-up 0.5s ease-out 0.1s forwards",
        "fade-up-delay-2": "fade-up 0.5s ease-out 0.2s forwards",
        "fade-up-delay-3": "fade-up 0.5s ease-out 0.3s forwards",
        "fade-in":         "fade-in 0.3s ease-out forwards",
        "slide-in-right":  "slide-in-right 0.3s ease-out forwards",
        "float":           "float 3s ease-in-out infinite",
        "float-slow":      "float 5s ease-in-out infinite",
        "pulse-soft":      "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
