import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#608afa",
          500: "#3b63f6",
          600: "#2544eb",
          700: "#1d33d8",
          800: "#1e2baf",
          900: "#1e2a8a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
