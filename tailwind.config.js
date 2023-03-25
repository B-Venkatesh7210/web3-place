/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./helpers/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: "#08BCD4",
        yellow: "#D0D408",
        cyan2: "#C8F1F1"
      },
      fontFamily: {
        guava: ["Guava Candy", "sans-serif"],
        gunplay: ["Gunplay", "sans-serif"],
        display: ["group-hover"],
      },
    },
  },
  plugins: [],
};
