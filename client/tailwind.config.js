/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    { pattern: /bg-(green|yellow|red|blue)-(100|200|300)/ },
    { pattern: /text-(green|yellow|red|blue)-600/ },
  ],
  theme: {
    extend: {
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
