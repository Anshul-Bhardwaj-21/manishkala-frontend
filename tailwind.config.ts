import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f2ea",
        linen: "#efe5d8",
        ink: "#23211d",
        muted: "#766f65",
        hairline: "#ded2c1",
        accent: "#8f3f2b",
        "accent-soft": "#ead8ca",
        sage: "#586b5b"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        editorial: "0 18px 60px rgba(35, 33, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
