// src/lib/axios.ts
import axios from 'axios';

// Creamos una "instancia" de axios con tu configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Lee la URL del .env
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // 1. Buscamos el token en localStorage
  const token = localStorage.getItem('token_visitante');
  
  // 2. Si existe, lo agregamos al header Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
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