// src/lib/axios.ts
import axios from 'axios';

// Creamos una "instancia" de axios con tu configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Lee la URL del .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// (Opcional pero recomendado) Interceptor para errores
// Si la API devuelve error, aquí podemos hacer un console.log automático
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la petición:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;