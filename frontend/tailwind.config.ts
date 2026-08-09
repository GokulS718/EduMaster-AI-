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
        slate: {
          900: "#0F172A",
          850: "#172033",
          800: "#1E293B",
          750: "#27354A",
          700: "#334155",
          600: "#475569",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        indigo: {
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
        },
      },
      backgroundImage: {
        "slate-gradient": "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        "emerald-gradient": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        "grid-pattern": "radial-gradient(rgba(16, 185, 129, 0.12) 1.5px, transparent 1.5px)",
      },
      boxShadow: {
        "emerald-glow": "0 0 20px -3px rgba(16, 185, 129, 0.35)",
        "emerald-strong": "0 0 30px 2px rgba(5, 150, 105, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
