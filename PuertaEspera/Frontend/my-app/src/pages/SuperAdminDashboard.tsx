import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectos } from '../services/proyectoService';
import type { Proyecto } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { AdminProjectModal } from '../components/AdminProjectModal';
import { CreateProjectModal } from '../components/CreateProjectModal'; // <--- IMPORTAR
import logo from '../assets/logoPuerta.svg';

export function SuperAdminDashboard() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);

    // Estado para el modal de EDICIÓN/VER (existente)
    const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);

    // Estado para el modal de CREACIÓN (nuevo)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar proyectos
    useEffect(() => {
        loadProyectos();
    }, []);

    const loadProyectos = () => {
        setLoading(true);
        getProyectos()
            .then(data => setProyectos(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    return (
        <div className="min-h-screen bg-brand-dark px-6 py-8 flex flex-col items-center relative">

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 max-w-4xl">
                <img src={logo} alt="Puerta 18" className="w-32" />
                <button
                    onClick={() => {
                        localStorage.removeItem('token_admin');
                        navigate('/admin');
                    }}
                    className="text-white/60 hover:text-white text-sm underline"
                >
                    Cerrar Sesión
                </button>
            </div>

            <h1 className="text-white text-3xl font-bold font-dm-sans mb-8 text-center">
                Panel de Control
            </h1>

            {/* Botón Flotante + (Abre el modal de creación) */}
            <button
                onClick={() => setIsCreateModalOpen(true)} // <--- AHORA ABRE EL MODAL
                className="fixed bottom-8 right-8 bg-white text-brand-purple w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl font-bold z-40 hover:scale-110 transition-transform cursor-pointer"
            >
                +
            </button>

            {/* Grilla */}
            {loading ? (
                <div className="text-white animate-pulse">Cargando stands...</div>
            ) : (
                <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                    {proyectos.map((proy) => (
                        <div key={proy.id} className="relative group">
                            <ProjectCard
                                proyecto={proy}
                                onClick={() => setSelectedProject(proy)}
                            />
                        </div>
                    ))}

                    {proyectos.length === 0 && (
                        <div className="col-span-full text-center text-white/50 py-10">
                            No hay stands creados aún. ¡Toca el + para empezar!
                        </div>
                    )}
                </div>
            )}

            {/* --- MODALES --- */}

            {/* 1. Modal de Gestión (Ya existía) */}
            {selectedProject && (
                <AdminProjectModal
                    isOpen={!!selectedProject}
                    proyecto={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}

            {/* 2. Modal de Creación (NUEVO) */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    loadProyectos(); // Recargamos la lista al crear uno nuevo
                }}
            />

        </div>
    );
}