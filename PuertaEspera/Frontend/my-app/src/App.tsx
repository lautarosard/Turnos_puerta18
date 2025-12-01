import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { VisitorLoginPage } from './pages/VisitorLoginPage';
import { ProjectListPage } from './pages/ProjectListPage';
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
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
