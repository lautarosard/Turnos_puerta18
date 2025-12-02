import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectos } from '../services/proyectoService';
import type { Proyecto } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { AdminProjectModal } from '../components/AdminProjectModal';
import { CreateProjectModal } from '../components/CreateProjectModal'; // <--- IMPORTAR
import logo from '../assets/logoPuerta.svg';
import flameLogo from './../assets/flame-icon.svg';

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
        <div className="min-h-screen bg-brand-background-dashboard px-6 py-8 flex flex-col items-center relative">

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 max-w-4xl">
                <img src={logo} alt="Puerta 18" className="w-28 md:w-32" />
                <button
                    onClick={() => {
                        localStorage.removeItem('token_admin');
                        navigate('/admin');
                    }}
                    className="text-white/60 hover:text-white text-sm underline mr-14"
                >
                    Cerrar Sesión
                </button>
            </div>
            {/* Botón Flotante + (Abre el modal de creación) */}
            <button
                onClick={() => setIsCreateModalOpen(true)} // <--- AHORA ABRE EL MODAL
                className="absolute top-[-5px] right-[-10px] w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl shadow-lg flex items-center justify-center text-3xl font-light transition-all backdrop-blur-sm border border-white/10"
            >
                +
            </button>

            <h1 className="text-white text-3xl font-bold font-dm-sans mb-8 text-center">
                Panel de Control
            </h1>


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


            {/* Fueguito Decorativo */}
            <div className="mt-auto py-6 opacity-80">
                <img src={flameLogo} alt="Puerta 18" className="w-12 animate-pulse" />
            </div>
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