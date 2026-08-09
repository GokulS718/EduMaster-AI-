import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#030712",
          900: "#0B0F19",
          850: "#0E1424",
        },
        slate: {
          900: "#111827",
          850: "#1F2937",
          800: "#374151",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        teal: {
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        violet: {
          400: "#A78BFA",
          500: "#8B5CF6",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "emerald-glow": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        "emerald-strong": "0 0 35px 2px rgba(13, 148, 136, 0.55)",
      },
    },
  },
  plugins: [],
};
export default config;
