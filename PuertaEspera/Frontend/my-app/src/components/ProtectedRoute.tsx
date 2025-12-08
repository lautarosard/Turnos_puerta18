import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  role: 'visitante' | 'admin';
  redirectPath?: string;
}

export const ProtectedRoute = ({ role, redirectPath }: Props) => {
  // 1. Verificación para VISITANTES
  const { isAuthenticated } = useAuth(); // Usamos tu contexto existente

  // 2. Verificación para ADMINS (Como ellos no usan el Context, leemos localStorage directo)
  const adminToken = localStorage.getItem('token_admin');

  const location = useLocation();
  const currentUrl = location.pathname + location.search;

  if (role === 'visitante') {
    if (!isAuthenticated) {
      // Si no es visitante autenticado, lo mandamos al registro (o a la landing)
      return <Navigate to={`/login-visitante?redirect=${encodeURIComponent(currentUrl)}`} replace />;
    }
  }

  if (role === 'admin') {
    if (!adminToken) {
      // Si no hay token de admin, lo mandamos al login de admin
      return <Navigate to={redirectPath || "/admin"} replace />;
    }
  }

  // Si pasa la verificación, mostramos el contenido de la ruta (Outlet)
  return <Outlet />;
};