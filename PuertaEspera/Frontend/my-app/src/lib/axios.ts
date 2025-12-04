// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Buscamos primero el token de ADMIN, luego el de VISITANTE
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
    console.error("Error Axios:", error.response?.data || error.message);

    // MEJORA: Detectar Token Vencido (401 o 403)
    if (error.response?.status === 401 || error.response?.status === 403) {

      // 1. Limpiamos la basura vieja
      localStorage.removeItem('token_admin');
      localStorage.removeItem('user_admin');
      localStorage.removeItem('token_visitante');
      localStorage.removeItem('datos_visitante');

      // 2. Opcional: Redirigir al inicio para que se logueen de nuevo
      // Usamos window.location porque aquí no tenemos acceso al 'navigate' de React
      // Solo redirigimos si NO estamos ya en una página de login (para evitar bucles)
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin')) {
        alert("Tu sesión expiró. Por favor ingresá nuevamente.");
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;