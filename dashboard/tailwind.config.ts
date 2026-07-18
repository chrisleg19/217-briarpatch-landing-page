import type { Config } from "tailwindcss";

// Brand palette mirrors the existing landing page (styles.css :root),
// so the dashboard feels like part of the same Legette Legacy Group brand.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#20312a",
          deep: "#182520",
        },
        brass: {
          DEFAULT: "#b08d57",
          light: "#c9a878",
        },
        cream: {
          DEFAULT: "#f7f4ee",
          alt: "#efe9df",
        },
        ink: {
          DEFAULT: "#23241f",
          soft: "#55564f",
        },
        line: "#ddd6c9",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Montserrat"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        brand: "0 18px 40px rgba(24, 37, 32, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
