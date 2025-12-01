import { useTurnos } from "../context/TurnoContext";
import type { Proyecto } from "./../types"; // Necesitarás buscar el nombre del proyecto

// Mapa de colores según el índice (para que salgan Cyan, Amarillo, Fucsia)
const COLORS = [
    'bg-brand-cyan text-brand-dark',   // 1ro
    'bg-brand-robot text-brand-dark',  // 2do
    'bg-brand-card text-white'         // 3ro
];

export function ActiveTicketsList() {
    const { turnosActivos, quitarTurnoLocal } = useTurnos();

    if (turnosActivos.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-40 flex flex-col gap-2 w-full max-w-sm px-4">
        {turnosActivos.map((turno, index) => {
            const colorClass = COLORS[index % COLORS.length]; // Cicla los colores
            
            return (
            <div key={turno.id} className={`${colorClass} p-4 rounded-xl shadow-lg relative animate-in slide-in-from-right`}>
                
                {/* Botón cerrar (X) */}
                <button 
                onClick={() => quitarTurnoLocal(turno.id)} // Aquí deberías llamar a cancelarTurno en la API también
                className="absolute top-2 right-2 opacity-50 hover:opacity-100 font-bold"
                >
                ✕
                </button>

                <h4 className="font-bold text-sm uppercase mb-1">
                {/* Aquí idealmente mostrarías el nombre del proyecto. 
                    El turno debería traer { proyecto: { nombre: ... } } o buscarlo */}
                Proyecto ID: {turno.proyectoId.slice(0, 5)}...
                </h4>
                
                <div className="flex justify-between items-end">
                <span className="text-xs opacity-90">Acercate al stand aprox. en:</span>
                <span className="text-2xl font-bold">{turno.tiempoDeEspera || 15} min</span>
                </div>
            </div>
            );
        })}
        </div>
    );
}