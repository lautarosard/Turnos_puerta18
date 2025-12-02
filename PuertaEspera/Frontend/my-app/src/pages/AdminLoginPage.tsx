import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './../components/ui/button';
import logo from './../assets/logoPuerta.svg';
import flameLogo from './../assets/flame-icon.svg';
import { loginAdmin } from '../services/authService';

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
            const data = await loginAdmin(username, password);

            // 1. Guardamos el token de Admin (usamos otra key para no mezclar con visitantes)
            localStorage.setItem('token_admin', data.token);
            localStorage.setItem('user_admin', JSON.stringify(data.user));

            // 2. Redirigimos según el rol
            if (data.user.rol === 'SUPER_ADMIN') {
                navigate('/admin/dashboard'); // A donde va el Jefe (Tú)
            } else {
                navigate('/admin/stand'); // A donde va el Encargado del Stand
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