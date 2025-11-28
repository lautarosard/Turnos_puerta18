import { useNavigate } from 'react-router-dom';
import { Button } from './../components/ui/button';
import logo from './../assets/logoPuerta.svg'; // Asegúrate de tener la imagen
import bgImage from './../assets/background.jpg'; 

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    // Contenedor principal con imagen de fondo
    <div 
      className="h-screen w-full bg-cover bg-center relative flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Capa violeta semitransparente (Overlay) */}
      <div className="absolute inset-0 bg-brand-purple/60 backdrop-blur-sm z-0"></div>

      {/* Contenido (z-10 para que flote sobre el overlay) */}
      <div className="z-10 flex flex-col items-center w-full max-w-md">
        
        {/* Logo */}
        <img src={logo} alt="Puerta 18" className="w-64 mb-10" />

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
        <div className="mt-12 text-2xl">🔥</div>
      </div>
    </div>
  );
}