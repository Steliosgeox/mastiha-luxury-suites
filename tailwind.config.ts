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
        plaster: "#F6F2E8",
        ink: "#0B202B",
        aegean: {
          DEFAULT: "#1A5268",
          dark: "#0F3240",
          light: "#2B7B9A",
        },
        mastiha: {
          leaf: "#73806B",
          resin: "#DCCB9D",
          amber: "#C8B17A",
        },
        stone: {
          DEFAULT: "#B7AA98",
          light: "#DFD8CD",
          dark: "#7A6F60",
        },
        chalk: "#FBFAF6",
        night: "#111310",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        wide: "0.08em",
        widest: "0.16em",
      },
      screens: {
        xs: "375px",
        "2xl": "1440px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};

export default config;
