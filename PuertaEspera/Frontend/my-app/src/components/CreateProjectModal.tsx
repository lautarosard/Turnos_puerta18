import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { crearProyecto, updateProyecto } from '../services/proyectoService';
import type { Proyecto } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Para avisarle al Dashboard que recargue
    projectToEdit?: Proyecto | null;
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

export function CreateProjectModal({ isOpen, onClose, onSuccess, projectToEdit }: Props) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        duracionEstimada: 5,
        imagenUrl: 'robot.svg',
        pa: false
    });

    // EFECTO: Cuando se abre el modal, chequeamos si es para EDITAR
    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                // MODO EDICIÓN: Cargamos datos existentes
                setForm({
                    nombre: projectToEdit.nombre,
                    descripcion: projectToEdit.descripcion || '',
                    duracionEstimada: projectToEdit.duracionEstimada || 0,
                    imagenUrl: projectToEdit.imagenUrl || 'robot.svg',
                    pa: projectToEdit.pa || false
                });
            } else {
                // MODO CREACIÓN: Limpiamos
                setForm({ nombre: '', descripcion: '', duracionEstimada: 5, imagenUrl: 'robot.svg', pa: false });
            }
        }
    }, [isOpen, projectToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (projectToEdit) {
                // --- ACTUALIZAR ---
                await updateProyecto(projectToEdit.id, {
                    nombre: form.nombre,
                    descripcion: form.descripcion,
                    duracionEstimada: Number(form.duracionEstimada),
                    imagenUrl: form.imagenUrl,
                    pa: form.pa
                });
            } else {
                // --- CREAR ---
                await crearProyecto({
                    nombre: form.nombre,
                    descripcion: form.descripcion,
                    duracionEstimada: Number(form.duracionEstimada),
                    imagenUrl: form.imagenUrl,
                    pa: form.pa
                });
            }

            onSuccess();
            onClose();

        } catch (error: any) {
            alert(error.response?.data?.message || "Error al procesar el stand");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#5A416B] w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-200 border border-white/10">

                {/* Título Dinámico */}
                <h2 className="text-2xl font-bold text-white mb-6 font-dm-sans text-center uppercase tracking-wide">
                    {projectToEdit ? 'Editar Stand' : 'Registrar Stand'}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* ... (Inputs iguales que antes) ... */}
                    <div>
                        <input
                            type="text" required placeholder="Nombre del stand"
                            className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium placeholder:text-gray-400"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                        />
                    </div>
                    <div>
                        <textarea
                            rows={4} placeholder="Info del stand"
                            className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium placeholder:text-gray-400 resize-none"
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-[2]">
                            <input
                                type="number" min="0" required placeholder="Tiempo (min)"
                                className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium placeholder:text-gray-400"
                                value={form.duracionEstimada}
                                onChange={e => setForm({ ...form, duracionEstimada: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex-1">
                            <select
                                className="w-full h-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium"
                                value={form.imagenUrl}
                                onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
                            >
                                {ICONS.map(icon => (<option key={icon.name} value={icon.name}>{icon.label}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* Switch PA */}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-white font-medium text-sm md:text-base">¿Pertenece a <br /> Programa Adolescencia?</span>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, pa: !form.pa })}
                            className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${form.pa ? 'bg-brand-purple' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-[10px] font-bold text-gray-600 ${form.pa ? 'translate-x-8' : 'translate-x-0'}`}>
                                {form.pa ? 'SI' : 'NO'}
                            </div>
                        </button>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4 mt-2">
                        <Button type="submit" disabled={loading} className="flex-1 bg-white hover:bg-gray-100 !text-brand-purple font-bold py-3 rounded-xl shadow-lg uppercase tracking-wide">
                            {loading ? '...' : (projectToEdit ? 'Guardar Cambios' : 'Registrar')}
                        </Button>
                        <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-gray-100 text-brand-purple font-bold py-3 rounded-xl shadow-lg uppercase tracking-wide transition-colors">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}