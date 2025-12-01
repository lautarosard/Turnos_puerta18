import type { Proyecto } from './../types/index';

interface ProjectCardProps {
    proyecto: Proyecto;
    onClick: (id: string) => void;
}

    export function ProjectCard({ proyecto, onClick }: ProjectCardProps) {
    
    // Lógica: Si el nombre incluye "Robot", usamos el color dorado, sino el fucsia
    // (O podrías usar un campo 'destacado' en la DB si prefieres)
    const isRobot = proyecto.nombre.toLowerCase().includes('robot guia');
    
    const bgClass = isRobot ? 'bg-brand-robot' : 'bg-brand-card';

    return (
        <div 
        onClick={() => onClick(proyecto.id)}
        className="flex flex-col items-center cursor-pointer group w-full"
        >
        {/* Caja de color */}
        <div className={`${bgClass} w-full aspect-square rounded-card flex items-center justify-center p-6 shadow-lg transition-transform group-hover:scale-105`}>
            {/* Ícono */}
            {proyecto.imagenUrl ? (
            <img 
                src={`/assets/icons/${proyecto.imagenUrl}`} 
                alt={proyecto.nombre}
                className="w-1/2 h-1/2 object-contain" 
            />
            ) : (
            <span className="text-4xl text-white">🚀</span>
            )}
        </div>

        {/* Título del Stand (DM Sans, 32px según diseño, ajustado a responsivo) */}
        <h3 className="mt-3 text-center text-white font-dm-sans font-normal text-lg leading-tight">
            {proyecto.nombre}
        </h3>
        </div>
    );
}