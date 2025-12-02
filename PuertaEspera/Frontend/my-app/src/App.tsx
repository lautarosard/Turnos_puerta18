import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { VisitorLoginPage } from './pages/VisitorLoginPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { StandAdminPage } from './pages/StandAdminPage';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: Pantalla de Bienvenida */}
        <Route path="/" element={<WelcomePage />} />

        {/* Ruta Login */}
        <Route path="/login-visitante" element={<VisitorLoginPage />} />
        {/* Futuras rutas */}
        <Route path='/proyectos' element={<ProjectListPage />} />
        {/* --- RUTA ADMIN --- */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />

        {/* stand individual: */}
        <Route path="/admin/stand/:id" element={<StandAdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
