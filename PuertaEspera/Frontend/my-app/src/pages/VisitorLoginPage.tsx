import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './../components/ui/button';
import logo from '../assets/logoPuerta.svg';

// Importaremos el servicio más adelante
// import { ingresarVisitante } from '../services/visitanteService'; 

export function VisitorLoginPage() {
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!nombre.trim()) return;

    try {
      console.log("Enviando nombre:", nombre);
      // AQUÍ LLAMAREMOS A TU API
      // const data = await ingresarVisitante(nombre);
      // guardarToken(data.token);
      
      // Si todo sale bien, vamos al dashboard
      // navigate('/dashboard');
    } catch (error) {
      alert("Error al ingresar");
    }
  };

  return (
    <div className="h-screen w-full bg-brand-dark flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <img src={logo} alt="Puerta 18" className="w-64 mb-16" />

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          <input 
            type="text" 
            placeholder="Nombre" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-4 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-brand-purple text-lg shadow-inner"
          />

          <Button type="submit">
            Ingresar
          </Button>
        </form>

        {/* Fueguito */}
        <div className="mt-20 text-3xl animate-bounce">🔥</div>
      </div>
    </div>
  );
}