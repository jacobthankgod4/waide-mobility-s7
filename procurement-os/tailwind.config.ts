import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Cascadia Mono", "Consolas", "monospace"],
      },
      colors: {
        ink: {
          950: "#070a0f",
          900: "#0b1017",
          850: "#10161f",
          800: "#151d28",
          700: "#1d2836",
          600: "#2a3849",
        },
        signal: {
          amber: "#f2a93b",
          emerald: "#37c391",
          rose: "#f2586a",
          sky: "#59a7f5",
          violet: "#9b8cf5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
