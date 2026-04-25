import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0b0e12",
          900: "#111a20",
          850: "#152025",
          800: "#1f252b",
          700: "#2b3038"
        },
        scope: {
          blue: "#2d7ff9",
          green: "#22c55e",
          amber: "#f59e0b"
        }
      },
      boxShadow: {
        phone: "0 30px 80px rgba(0, 0, 0, 0.55)",
        soft: "0 20px 60px rgba(15, 23, 42, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
