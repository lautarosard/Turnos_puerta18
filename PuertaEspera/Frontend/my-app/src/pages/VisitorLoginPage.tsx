import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './../components/ui/button';
import logo from '../assets/logoPuerta.svg';
import flameLogo from './../assets/flame-icon.svg';
import { ingresarVisitante } from './../services/visitanteService';
// Importaremos el servicio más adelante
// import { ingresarVisitante } from '../services/visitanteService'; 

export function VisitorLoginPage() {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!nombre.trim()) return;

    setLoading(true); // Activamos estado de carga

    try {
      console.log("Enviando nombre:", nombre);
      
      // 2. LLAMADA REAL A LA API
      const data = await ingresarVisitante(nombre);
      
      console.log("Respuesta del Server:", data); // <--- MIRA ESTO EN CONSOLA

      // 3. Guardamos el Token (Fundamental)
      localStorage.setItem('token_visitante', data.token);
      localStorage.setItem('datos_visitante', JSON.stringify(data.visitante));
      
      // 4. Feedback visual
      alert(`¡Bienvenido ${data.visitante.nombre}! Token guardado.`);
      
      // Aquí redirigiremos en el futuro:
      // navigate('/dashboard-proyectos');

    } catch (error: any) {
      console.error(error);
      alert("Error al conectar: " + (error.message || "Desconocido"));
    } finally {
      setLoading(false); // Desactivamos carga pase lo que pase
    }
  };

  return (
    <div className="h-screen w-full bg-brand-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <img src={logo} alt="Puerta 18" className="w-64 mb-16" />

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <input 
            type="text" 
            placeholder="Nombre" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading} // Se bloquea mientras carga
            className="w-full p-4 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-brand-purple text-lg shadow-inner disabled:bg-gray-200"
          />

          <Button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        {/* Fueguito */}
        <div className="mt-20 text-3xl animate-bounce">
        <img src={flameLogo} alt="Puerta 18" className="w-64 mb-10" />

        </div>
      </div>
    </div>
  );
}