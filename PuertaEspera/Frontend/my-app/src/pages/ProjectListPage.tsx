import { useEffect, useState } from 'react';
import { getProyectos } from './../services/proyectoService';
import type { Proyecto } from './../types/index';
import { useAuth } from './../context/AuthContext';
import { ProjectCard } from './../components/ProjectCard';
import logo from './../assets/logoPuerta.svg';
import { useTurnos } from './../context/TurnoContext';
import { ActiveTicketsList } from './../components/ActiveTicketsList';

import { Button } from './../components/ui/button';
import { ProjectModal } from './../components/ProjectModal';

export function ProjectListPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const { turnosActivos } = useTurnos(); 
    
    // --- ESTADO QUE FALTABA (Para abrir el modal del proyecto) ---
    const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
    
    // Estado para el modal de error (Límite alcanzado)
    const [showLimitModal, setShowLimitModal] = useState(false); 

    useEffect(() => {
        getProyectos()
        .then(data => setProyectos(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, []);

    const handleSelectProject = (id: string) => {
        // 1. Primero buscamos el proyecto para saber de qué tipo es
        const proyecto = proyectos.find(p => p.id === id);
        
        if (!proyecto) return; // Por seguridad

        // 2. Definimos si es informativo (igual que en el Modal)
        // Si dura 0 o menos, o es nulo, es informativo
        const esInformativo = !proyecto.duracionEstimada || proyecto.duracionEstimada <= 0;

        // 3. VALIDACIÓN INTELIGENTE:
        // Solo bloqueamos SI NO es informativo Y SI ya tiene 3 turnos
        if (!esInformativo && turnosActivos.length >= 3) {
            setShowLimitModal(true); // "Alcanzaste el máximo"
            return;
        }

        // 4. Si pasó la validación (o es informativo), abrimos el modal
        setSelectedProject(proyecto);
    };

    const handleCloseProjectModal = () => {
        setSelectedProject(null);
    };
//text-white text-4xl md:text-5xl font-bold font-dolce mb-6 uppercase tracking-wide
    return (
        <div className="min-h-screen bg-brand-background px-6 py-10 flex flex-col items-center">
        
        {/* 1. Lista de Tickets Activos (Arriba a la derecha) */}
        <ActiveTicketsList proyectos={proyectos}/>

        {/* Logo */}
        <img src={logo} alt="Puerta 18" className="w-1/2 max-w-[200px] md:max-w-[300px] h-auto mx-auto mb-8 object-contain" />

        {/* Saludo y Textos */}
        <div className="text-center mb-12 w-full max-w-2xl">
            <h1 className="font-dolce font-bold text-[36px] leading-none tracking-normal text-white">
            BIENVENIDX {user?.nombre || "INVITADO"}!
            </h1>
            
            <p className="mt-2 text-white font-dm-sans text-[15px] md:text-2xl leading-snug">
            Tenés un límite de{' '}
            <span className="text-brand-cyan italic">3 filas simultáneas</span>.
            <br />
            Al terminar una, podes unirte a otra.
            </p>
        </div>

        {/* Grilla de Proyectos */}
        {loading ? (
            <div className="text-white animate-pulse">Cargando experiencias...</div>
        ) : (
            <div className="w-full max-w-4xl grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {proyectos.map((proy) => (
                <ProjectCard 
                key={proy.id} 
                proyecto={proy} 
                onClick={handleSelectProject}
                />
            ))}
            </div>
        )}

        {/* --- MODALES --- */}

        {/* A. Modal de Detalle de Proyecto (Para iniciar fila) */}
        {selectedProject && (
            <ProjectModal 
                isOpen={!!selectedProject}
                proyecto={selectedProject}
                onClose={handleCloseProjectModal}
            />
        )}

        {/* B. Modal de Error (Límite Alcanzado) */}
        {showLimitModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white rounded-[21px] p-8 text-center max-w-sm shadow-2xl animate-in zoom-in duration-200">
                    <h2 className="text-2xl font-bold text-brand-background mb-4 font-dm-sans">
                        Alcanzaste el máximo de turnos permitidos
                    </h2>
                    <p className="text-brand-card italic font-medium mb-8 font-dm-sans">
                        Sólo podés tener 3 turnos activos.
                    </p>
                    
                    {/* Botón Volver (Ahora sí importado) */}
                    <Button 
                        onClick={() => setShowLimitModal(false)} 
                        className="bg-brand-card hover:bg-pink-600 w-full rounded-xl"
                    >
                        Volver
                    </Button>
                </div>
            </div>
        )}

        </div>
    );
}