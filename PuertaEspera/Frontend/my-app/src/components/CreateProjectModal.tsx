import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { crearProyecto, updateProyecto } from '../services/proyectoService';
import type { Proyecto } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectToEdit?: Proyecto | null;
}

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
    { name: 'peli.svg', label: 'Peli' },
    { name: 'proximo_trabajoN1.svg', label: 'TrabajoN1' },
    { name: 'proximo_trabajoN2.svg', label: 'TrabajoN2' },
    { name: 'proximo_trabajoN3.svg', label: 'TrabajoN3' },
    { name: 'proximo_trabajoN4.svg', label: 'TrabajoN4' },
    { name: 'pulso_robotico.svg', label: 'Pulso robotico' }
];

export function CreateProjectModal({ isOpen, onClose, onSuccess, projectToEdit }: Props) {
    const [loading, setLoading] = useState(false);

    // 1. Agregamos capacidadMaxima al estado
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        duracionEstimada: 5,
        capacidadMaxima: 1, // <--- NUEVO CAMPO (Default 1 para fila india)
        imagenUrl: 'robot.svg',
        pa: false
    });

    // 2. Cargamos el dato si editamos
    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                setForm({
                    nombre: projectToEdit.nombre,
                    descripcion: projectToEdit.descripcion || '',
                    duracionEstimada: projectToEdit.duracionEstimada || 0,
                    capacidadMaxima: projectToEdit.capacidadMaxima || 1, // <--- CARGAMOS
                    imagenUrl: projectToEdit.imagenUrl || 'robot.svg',
                    pa: projectToEdit.pa || false
                });
            } else {
                setForm({
                    nombre: '',
                    descripcion: '',
                    duracionEstimada: 5,
                    capacidadMaxima: 1, // <--- RESETEAMOS
                    imagenUrl: 'robot.svg',
                    pa: false
                });
            }
        }
    }, [isOpen, projectToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Preparamos el objeto con todos los campos
            const datosAEnviar = {
                nombre: form.nombre,
                descripcion: form.descripcion,
                duracionEstimada: Number(form.duracionEstimada),
                capacidadMaxima: Number(form.capacidadMaxima), // <--- ENVIAMOS COMO NÚMERO
                imagenUrl: form.imagenUrl,
                pa: form.pa
            };

            if (projectToEdit) {
                await updateProyecto(projectToEdit.id, datosAEnviar);
            } else {
                await crearProyecto(datosAEnviar);
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

                <h2 className="text-2xl font-bold text-white mb-6 font-dm-sans text-center uppercase tracking-wide">
                    {projectToEdit ? 'Editar Stand' : 'Registrar Stand'}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
                            rows={3} placeholder="Info del stand"
                            className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium placeholder:text-gray-400 resize-none"
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>

                    {/* FILA DE NÚMEROS: Tiempo y Capacidad */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-white/70 ml-2 mb-1 block">Duración (min)</label>
                            <input
                                type="number" min="0" required
                                className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium text-center"
                                value={form.duracionEstimada}
                                onChange={e => setForm({ ...form, duracionEstimada: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-white/70 ml-2 mb-1 block">Cupo Máx.</label>
                            <input
                                type="number" min="1" required
                                className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium text-center"
                                value={form.capacidadMaxima}
                                onChange={e => setForm({ ...form, capacidadMaxima: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Selector de Icono */}
                    <div>
                        <label className="text-xs text-white/70 ml-2 mb-1 block">Icono</label>
                        <select
                            className="w-full p-4 rounded-xl text-gray-700 bg-white outline-none focus:ring-4 focus:ring-brand-purple/50 font-medium"
                            value={form.imagenUrl}
                            onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
                        >
                            {ICONS.map(icon => (<option key={icon.name} value={icon.name}>{icon.label}</option>))}
                        </select>
                    </div>

                    {/* Switch PA */}
                    <div className="flex items-center justify-between px-2 bg-white/5 p-3 rounded-xl">
                        <span className="text-white font-medium text-sm">¿Pertenece a <br /> Programa Adolescencia?</span>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, pa: !form.pa })}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${form.pa ? 'bg-brand-purple' : 'bg-gray-400'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-[10px] font-bold text-gray-600 ${form.pa ? 'translate-x-6' : 'translate-x-0'}`}>
                                {form.pa ? 'SI' : 'NO'}
                            </div>
                        </button>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4 mt-2">
                        <Button type="submit" disabled={loading} className="flex-1 bg-white hover:bg-gray-100 !text-brand-purple font-bold py-3 rounded-xl shadow-lg uppercase tracking-wide">
                            {loading ? '...' : (projectToEdit ? 'Guardar' : 'Registrar')}
                        </Button>
                        <button type="button" onClick={onClose} className="flex-1 border-2 border-white/30 text-white hover:bg-white/10 font-bold py-3 rounded-xl shadow-lg uppercase tracking-wide transition-colors">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}