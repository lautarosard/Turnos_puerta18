import { useState } from 'react';
import { Button } from './ui/button';
import { crearProyecto } from '../services/proyectoService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Para avisarle al Dashboard que recargue
}

// Lista de iconos disponibles en tu carpeta assets/icons
// (Asegúrate de que los nombres coincidan con tus archivos .svg)
const ICONS = [
    { name: 'robot.svg', label: 'Robot' },
    { name: 'lucha.svg', label: 'Lucha' },
    { name: 'piloto.svg', label: 'Piloto' },
    { name: 'trabajo.svg', label: 'Trabajo' },
    { name: 'pintar.svg', label: 'Pintar' },
    { name: 'hablar.svg', label: 'Hablar' },
    { name: 'exs.svg', label: 'Exs' },
    { name: 'libros.svg', label: 'Libros' },
    { name: 'sol.svg', label: 'Sol' },
    { name: 'proyector.svg', label: 'Proyector' },
    { name: 'editar.svg', label: 'Editar' },
    { name: 'camara.svg', label: 'Camara' },
    { name: 'estrella.svg', label: 'Estrella' },
    { name: 'peli.svg', label: 'Peli' }

];

export function CreateProjectModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);

    // Estado del formulario
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        duracionEstimada: 5,
        imagenUrl: 'robot.svg', // Icono por defecto
        pa: false
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await crearProyecto({
                nombre: form.nombre,
                descripcion: form.descripcion,
                duracionEstimada: Number(form.duracionEstimada),
                imagenUrl: form.imagenUrl,
                pa: form.pa
            });

            // Si sale bien:
            onSuccess(); // Recargamos la grilla de atrás
            onClose();   // Cerramos el modal

        } catch (error: any) {
            alert(error.response?.data?.message || "Error al crear el stand");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-brand-background-dashboard/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-200">

                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-dm-sans">
                    Nuevo Stand
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Stand</label>
                        <input
                            type="text" required
                            placeholder="Ej: Robot Guía"
                            className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                        <input
                            type="text"
                            placeholder="Ej: Interactuá con nuestro robot..."
                            className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple"
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>

                    {/* Duración y Icono (en fila) */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Duración (min)</label>
                            <input
                                type="number" min="0" required
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple"
                                value={form.duracionEstimada}
                                onChange={e => setForm({ ...form, duracionEstimada: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Ícono</label>
                            <select
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple"
                                value={form.imagenUrl}
                                onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
                            >
                                {ICONS.map(icon => (
                                    <option key={icon.name} value={icon.name}>{icon.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* --- SWITCH PROGRAMA ADOLESCENCIA --- */}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-black font-medium text-sm md:text-base">
                            ¿Pertenece a <br /> Programa Adolescencia?
                        </span>

                        {/* Toggle Switch Personalizado */}
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, pa: !form.pa })}
                            className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${form.pa ? 'bg-brand-purple' : 'bg-gray-300'}`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-[10px] font-bold text-gray-600 ${form.pa ? 'translate-x-8' : 'translate-x-0'}`}
                            >
                                {form.pa ? 'SI' : 'NO'}
                            </div>
                        </button>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 mt-4">
                        <Button type="submit" disabled={loading} className="flex-1 bg-[#9406F1]">
                            {loading ? 'Creando...' : 'Crear Stand'}
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}