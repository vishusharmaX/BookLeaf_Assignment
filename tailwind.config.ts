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
        forest: {
          50: "#F0F5F2",
          100: "#DCE7E1",
          200: "#B8D0C3",
          300: "#8EB39F",
          400: "#5D8E76",
          500: "#366B53",
          600: "#275440",
          700: "#1E4232",
          800: "#163427",
          900: "#0F261C",
          950: "#081510",
        },
        ivory: {
          50: "#FCFBF8",
          100: "#FAF7F2",
          200: "#F4EFE7",
          300: "#EBE3D7",
          400: "#DCD0C0",
          500: "#C7B6A1",
        },
        sage: {
          50: "#F4F7F5",
          100: "#E5ECE7",
          200: "#CCD9D0",
          300: "#AAC0B1",
          400: "#83A28D",
          500: "#62856D",
          600: "#4D6B56",
          700: "#3D5444",
          800: "#324337",
          900: "#2B382F",
        },
        charcoal: {
          DEFAULT: "#1C2420",
          muted: "#5B6B63",
          subtle: "#8A9992",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
