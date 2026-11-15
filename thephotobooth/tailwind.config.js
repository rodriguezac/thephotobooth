/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de la marca
        brand: {
          black: "#000000",
          pink:  "#ff0da2",
        },
        // Colores sólidos para el fondo del strip
        solid: {
          rose:    "#df7a9a",
          blush:   "#fdb9cf",
          petal:   "#f9ced8",
          cream:   "#fff5cf",
          orange:  "#ff914d",
          lime:    "#c0c63a",
          sage:    "#cad6ba",
          sky:     "#c2e7ed",
          ice:     "#cdf8ff",
          white:   "#ffffff",
        },
      },
      fontFamily: {
        silkscreen: ["Silkscreen", "monospace"],
      },
      backgroundImage: {
        "polkadots": "url('/background/polkadots-1.webp')",
      },
      keyframes: {
        slideUp: {
          "0%":   { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        stripEject: {
          "0%":   { transform: "translateY(120%)" },
          "60%":  { transform: "translateY(-10%)" },
          "80%":  { transform: "translateY(5%)" },
          "100%": { transform: "translateY(0)" },
        },
        flashIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "50%":  { opacity: "1", transform: "scale(1.02)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":       { transform: "scale(1.05)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%":       { transform: "rotate(2deg)" },
        },
      },
      animation: {
        "slide-up":    "slideUp 0.4s ease-out",
        "strip-eject": "stripEject 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "flash-in":    "flashIn 0.3s ease-out forwards",
        "pulse-slow":  "pulse 2s ease-in-out infinite",
        "wiggle":      "wiggle 0.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
