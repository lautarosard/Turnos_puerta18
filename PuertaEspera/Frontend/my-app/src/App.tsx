import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { VisitorLoginPage } from './pages/VisitorLoginPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { StandAdminPage } from './pages/StandAdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login-visitante" element={<VisitorLoginPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* --- RUTAS PROTEGIDAS PARA VISITANTES --- */}
        {/* Todo lo que pongas aquí dentro requiere token de visitante */}
        <Route element={<ProtectedRoute role="visitante" />}>
            <Route path='/proyectos' element={<ProjectListPage />} />
        </Route>

        {/* --- RUTAS PROTEGIDAS PARA ADMINS --- */}
        {/* Todo lo que pongas aquí dentro requiere token de admin */}
        <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/stand/:id" element={<StandAdminPage />} />
            {/* Redirección por defecto si entran a /admin/stand sin ID */}
            <Route path="/admin/stand" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
