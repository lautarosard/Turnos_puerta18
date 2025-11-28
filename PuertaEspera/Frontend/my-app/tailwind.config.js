/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#8B00FF', // Pon el código HEX exacto de tu diseño (Botón)
        'brand-dark': '#1A0526',   // El fondo oscuro de la derecha
      }
    },
  },
  plugins: [],
}