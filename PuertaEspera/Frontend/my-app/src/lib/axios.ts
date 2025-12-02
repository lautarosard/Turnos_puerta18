// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // CAMBIO CLAVE:
  // Buscamos primero el token de ADMIN. Si no existe, buscamos el de VISITANTE.
  const token = localStorage.getItem('token_admin') || localStorage.getItem('token_visitante');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Esto te ayuda a debuguear en consola
    console.error("Error Axios:", error.response?.data || error.message);

    // Opcional: Si el token expiró (401), podrías redirigir al login
    if (error.response?.status === 401) {
      // console.log("Sesión expirada");
    }

    return Promise.reject(error);
  }
);

export default api;