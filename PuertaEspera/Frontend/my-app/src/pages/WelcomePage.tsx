import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Button } from './../components/ui/button';
import logo from './../assets/logoPuerta.svg'; // Asegúrate de tener la imagen
import bgImage from './../assets/background.jpg';
import flameLogo from './../assets/flame-icon.svg';

export function WelcomePage() {
  const navigate = useNavigate();
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/proyectos');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    // Contenedor principal con imagen de fondo
    <div
      className="h-dvh w-full bg-cover bg-center relative flex flex-col items-center justify-evenly p-4 overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

      {/* Contenido (z-10 para que flote sobre el overlay) */}
      <div className="z-10 flex flex-col items-center w-full max-w-md">

        {/* Logo */}
        <img src={logo} alt="Puerta 18" className="w-48 md:w-64 mb-6 md:mb-10" />

        {/* Tarjeta Blanca */}
        <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center w-full">
          <p className="text-gray-800 font-medium mb-6 leading-relaxed">
            Celebramos un nuevo año muy especial de experimentación,
            aprendizaje y creatividad colectiva. ¡Súmate a descubrir
            el talento que se enciende en Puerta 18!
          </p>

          <Button onClick={() => navigate('/login-visitante')}>
            Continuar
          </Button>
        </div>

        {/* Fueguito (Footer) */}
        <div className="mt-8 md:mt-12">
          <img src={flameLogo} alt="Puerta 18" className="w-24 md:w-48" />

        </div>
      </div>
    </div>
  );
}