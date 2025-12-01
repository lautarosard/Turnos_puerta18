/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#EF0886', // Pon el código HEX exacto de tu diseño (Botón)
        'brand-dark': '#300C23',   // El fondo oscuro de la derecha
        // Tus colores exactos:
        'brand-background': '#300C23', // El violeta oscuro de fondo
        'brand-robot': '#EFB654',      // Amarillo del Robot
        'brand-card': '#EF0886',       // Fucsia de las otras cajas
        'brand-cyan': '#10DAED',       // Celeste para "3 filas simultáneas"
      },
      fontFamily: {
        // Definimos las fuentes (luego las importamos)
        'dm-sans': ['"DM Sans"', 'sans-serif'],
        'dolce': ['"Dolce Vita"', 'sans-serif'], // Nombre corto para Dolce Vita Heavy
      },
      borderRadius: {
        'card': '21px', // Tu radio específico
      }
    },
  },
  plugins: [],
}