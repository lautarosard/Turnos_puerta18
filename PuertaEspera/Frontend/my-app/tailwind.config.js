/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#EF0886', // Pon el código HEX exacto de tu diseño (Botón)
        'brand-dark': '#300C23',   // El fondo oscuro de la derecha
        // Tus colores exactos:
        'brand-background-dashboard': '#5A416B',   // El fondo oscuro de la derecha
        'brand-background': '#300C23', // El violeta oscuro de fondo
        'brand-robot': '#EFB654',      // Amarillo del Robot
        'brand-card': '#854DC1',       // Fucsia de las otras cajas
        'brand-card2': '#EF0886',       // Fucsia de las otras cajas
        'brand-cyan': '#10DAED',       // Celeste para "3 filas simultáneas"
      },
      fontFamily: {
        // Aquí conectamos el nombre de clase 'font-dolce' con la fuente que definimos en CSS
        'dolce': ['"Dolce Vita Heavy"', 'sans-serif'], 
        'dm-sans': ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '21px', // Tu radio específico
      }
    },
  },
  plugins: [],
}