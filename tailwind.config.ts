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
        brand: {
          50: "#fdf8f0",
          100: "#faecd8",
          200: "#f4d5a8",
          300: "#ecb872",
          400: "#e49440",
          500: "#dc7a22",
          600: "#c96118",
          700: "#a74b16",
          800: "#873c19",
          900: "#6e3218",
          950: "#3b170a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
