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
        background: "#090d16",
        foreground: "#f8fafc",
        electric: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        slate: {
          850: "#0f172a",
          900: "#0b1120",
          950: "#050811",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "radial-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px)",
        "glow-gradient": "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 70%)",
      },
      boxShadow: {
        "electric-glow": "0 0 25px -5px rgba(59, 130, 246, 0.3)",
        "electric-strong": "0 0 35px 2px rgba(37, 99, 235, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
