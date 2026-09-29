import type { Config } from "tailwindcss";

// Tailwind supplies only its base reset (preflight); components use CSS modules.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
