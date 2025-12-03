import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './../components/ui/button';
import logo from './../assets/logoPuerta.svg';
import flameLogo from './../assets/flame-icon.svg';
import { loginAdmin } from '../services/authService';
import { getProyectos } from '../services/proyectoService';

export function AdminLoginPage() {
    const navigate = useNavigate();

    // Estados para los inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("1. Intentando login con:", username);
            const data = await loginAdmin(username, password);
            console.log("2. Login exitoso. Rol:", data.user.rol);

            localStorage.setItem('token_admin', data.token);
            localStorage.setItem('user_admin', JSON.stringify(data.user));

            if (data.user.rol === 'SUPER_ADMIN') {
                navigate('/admin/dashboard');
            } else {
                console.log("3. Buscando stand asignado...");
                // Buscamos cuál es su stand
                try {
                    const misProyectos = await getProyectos();
                    console.log("4. Proyectos encontrados:", misProyectos); // <--- ESTO ES LO IMPORTANTE

                    if (misProyectos && misProyectos.length > 0) {
                        console.log("5. Redirigiendo al stand:", misProyectos[0].id);
                        navigate(`/admin/stand/${misProyectos[0].id}`);
                    } else {
                        console.warn("ERROR: Lista de proyectos vacía");
                        setError('No tienes ningún stand asignado. Pide al Super Admin que te asigne uno.');
                        localStorage.removeItem('token_admin');
                    }
                } catch (err) {
                    console.error("Error buscando proyectos:", err);
                    setError('Error de conexión al buscar tu stand.');
                }
            }

        } catch (err: any) {
            console.error(err);
            setError('Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Decoración de fondo (opcional, simula las luces del diseño) */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent pointer-events-none"></div>

            <div className="z-10 w-full max-w-sm flex flex-col items-center">

                {/* Logo */}
                <img src={logo} alt="Puerta 18" className="w-64 mb-12 drop-shadow-lg" />

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">

                    {/* Input Usuario */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 rounded-xl text-gray-800 outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium placeholder:text-gray-400"
                        />
                    </div>

                    {/* Input Contraseña */}
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl text-gray-800 outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium placeholder:text-gray-400"
                        />
                    </div>

                    {/* Mensaje de Error */}
                    {error && (
                        <p className="text-red-400 text-sm text-center font-bold animate-pulse">
                            {error}
                        </p>
                    )}

                    {/* Botón Ingresar */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-[#EF0886] hover:bg-[#d00775] mt-4 rounded-xl text-lg h-14"
                    >
                        {loading ? 'Entrando...' : 'Ingresar'}
                    </Button>
                </form>

                {/* Fueguito Abajo */}
                <div className="mt-16 opacity-80">
                    <img src={flameLogo} alt="Puerta 18" className="w-16" />
                </div>

            </div>
        </div>
    );
}