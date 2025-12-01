import { useEffect, useState } from 'react';
import { getProyectos } from './../services/proyectoService';
import type { Proyecto } from './../types/index';
import { useAuth } from './../context/AuthContext';
import { ProjectCard } from './../components/ProjectCard';
import logo from './../assets/logoPuerta.svg';

export function ProjectListPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        getProyectos()
        .then(data => setProyectos(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, []);

    const handleSelectProject = (id: string) => {
        alert(`Elegiste el proyecto ${id}`); // Aquí iría la lógica de solicitar turno
    };

    return (
        <div className="min-h-screen bg-brand-background px-6 py-10 flex flex-col items-center">
        
        {/* Logo */}
        <img src={logo} alt="Puerta 18" className="w-64 mb-12" />

        {/* Saludo y Textos */}
        <div className="text-center mb-12 w-full max-w-2xl">
            {/* Saludo con fuente 'Dolce Vita' (o fallback a sans-serif bold) */}
            <h1 className="text-white text-4xl md:text-5xl font-bold font-dolce mb-6 uppercase tracking-wide">
            BIENVENIDX {user?.nombre || "INVITADO"}!
            </h1>
            
            {/* Texto descriptivo DM Sans */}
            <p className="text-white font-dm-sans text-xl md:text-2xl leading-snug">
            Tenés un límite de{' '}
            {/* El texto destacado en celeste e itálica */}
            <span className="text-brand-cyan italic">3 filas simultáneas</span>.
            <br />
            Al terminar una, podes unirte a otra.
            </p>
        </div>

        {/* Grilla de Proyectos */}
        {loading ? (
            <div className="text-white animate-pulse">Cargando experiencias...</div>
        ) : (
            // Grid responsive: 2 columnas en celular, 3 o 4 en pantallas más grandes
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
        </div>
    );
}