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
          950: "#0F172A",
          900: "#141E2E",
          800: "#1E293B",
          700: "#334155",
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
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
        },
        indigo: {
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
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
