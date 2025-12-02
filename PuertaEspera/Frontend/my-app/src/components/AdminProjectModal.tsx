import { useState } from 'react';
import type { Proyecto } from '../types';
import { Button } from './ui/button';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface Props {
    proyecto: Proyecto;
    isOpen: boolean;
    onClose: () => void;
}

export function AdminProjectModal({ proyecto, isOpen, onClose }: Props) {
    const navigate = useNavigate();
    // Controlamos qué se ve dentro del modal: 'menu' | 'registro'
    const [view, setView] = useState<'menu' | 'registro'>('menu');

    // Estados del formulario
    const [formData, setFormData] = useState({ username: '', password: '', confirm: '', nombre: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // --- ACCIONES ---

    const handleVerAdmin = () => {
        // Redirigir a la vista de "Encargado" de este stand específico
        // (Asumimos que como SuperAdmin puedes ver cualquier stand)
        navigate(`/admin/stand/${proyecto.id}`);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm) {
            alert("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            // 1. Creamos el usuario
            await registerUser({
                username: formData.username,
                password: formData.password,
                nombre: formData.nombre
            });

            alert(`¡Admin ${formData.nombre} registrado con éxito!`);

            // TODO: Aquí idealmente asignaríamos este usuario al proyecto en el Backend
            // Por ahora, el usuario queda creado suelto. 
            // (Para la v2: endpoint para asignar usuario a proyecto)

            onClose(); // Cerramos todo
        } catch (error: any) {
            alert(error.response?.data?.message || "Error al registrar");
        } finally {
            setLoading(false);
        }
    };

    // Resetear la vista al cerrar
    const handleClose = () => {
        setView('menu');
        setFormData({ username: '', password: '', confirm: '', nombre: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in zoom-in duration-200">

                {/* Botón Cerrar */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
                >
                    ✕
                </button>

                {/* --- VISTA 1: MENÚ DE OPCIONES --- */}
                {view === 'menu' && (
                    <div className="text-center flex flex-col items-center gap-4 py-4">
                        <h2 className="text-2xl font-bold text-gray-900 font-dm-sans mb-2">
                            {proyecto.nombre}
                        </h2>
                        <p className="text-gray-500 text-sm mb-4">
                            Gestión del Stand
                        </p>

                        <Button onClick={() => setView('registro')} className="bg-[#EF0886] hover:bg-pink-700 w-full">
                            Registrar admin.
                        </Button>

                        <Button onClick={handleVerAdmin} className="bg-[#EF0886] hover:bg-pink-700 w-full">
                            Ver admin.
                        </Button>
                    </div>
                )}

                {/* --- VISTA 2: FORMULARIO REGISTRO --- */}
                {view === 'registro' && (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">REGISTRAR ADMIN</h2>

                        <form onSubmit={handleRegister} className="flex flex-col gap-3">
                            <input
                                type="text" placeholder="Nombre (ej: Maru)" required
                                className="p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-brand-purple"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Usuario (ej: diseño)" required
                                className="p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-brand-purple"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                            <input
                                type="password" placeholder="Contraseña" required
                                className="p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-brand-purple"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <input
                                type="password" placeholder="Confirmar contraseña" required
                                className="p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-brand-purple"
                                value={formData.confirm}
                                onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                            />

                            <div className="flex gap-2 mt-4">
                                <Button type="submit" disabled={loading} className="flex-1 bg-[#EF0886]">
                                    {loading ? '...' : 'Registrar'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setView('menu')}
                                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Volver
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}