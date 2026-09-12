import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        luxury: {
          dark: "#0a0a0c",
          card: "#121216",
          border: "#23232a",
          gold: "#D4AF37",
          "gold-light": "#F5E6AB",
          accent: "#C5A880",
          muted: "#8E8E93"
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
} satisfies Config;
