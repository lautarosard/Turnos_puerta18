import { useState } from "react";
import { useTurnos } from "../context/TurnoContext";
import type { Proyecto } from "../types";
import { Button } from "./ui/button";
import { cancelarTurno } from "../services/turnoService";

interface Props {
    proyectos: Proyecto[]; // Recibimos los proyectos para buscar los nombres
}

    // Colores para los cartelitos (Cyan, Amarillo, Fucsia)
const COLORS = [
'bg-brand-cyan text-brand-dark',   
'bg-brand-robot text-brand-dark',  
'bg-brand-card text-white'         
];

export function ActiveTicketsList({ proyectos }: Props) {
    // Ahora sí existe quitarTurnoLocal gracias al Paso 1
    const { turnosActivos, quitarTurnoLocal } = useTurnos();
    
    // Estado para guardar el ID del turno que se quiere cancelar
    const [turnoParaCancelar, setTurnoParaCancelar] = useState<string | null>(null);

    // Helper para buscar el nombre del proyecto
    const getNombreProyecto = (id: string) => {
        const proy = proyectos?.find(p => p.id === id);
        return proy ? proy.nombre : "Cargando...";
    };

    const handleConfirmarCancelacion = async () => {
        if (!turnoParaCancelar) return;
        
        // Buscamos el turno completo
        const turno = turnosActivos.find(t => t.id === turnoParaCancelar);
        if (!turno) return;

        try {
        // 1. Llamada a la API
        await cancelarTurno(turno.id, turno.proyectoId);
        
        // 2. Lo sacamos de la lista visualmente
        quitarTurnoLocal(turno.id);
        
        // 3. Cerramos el modal
        setTurnoParaCancelar(null);
        } catch (error) {
        alert("Error al cancelar el turno");
        }
    };

    if (turnosActivos.length === 0) return null;

    return (
        <>
        {/* --- 1. LISTA DE CARTELITOS (Arriba a la derecha) --- */}
        <div className="fixed top-4 right-4 z-40 flex flex-col gap-3 w-full max-w-xs px-3 pointer-events-none">
            {/* pointer-events-none deja hacer clic "a través" del contenedor, 
                pero reactivamos los clicks en los items con pointer-events-auto */}
                
            {turnosActivos.map((turno, index) => {
            const colorClass = COLORS[index % COLORS.length];
            
            return (
                <div 
                key={turno.id} 
                className={`${colorClass} p-4 rounded-xl shadow-lg relative pointer-events-auto animate-in slide-in-from-right duration-300`}
                >
                
                {/* Botón X para cancelar */}
                <button 
                    onClick={() => setTurnoParaCancelar(turno.id)} 
                    className="absolute top-3 right-3 opacity-60 hover:opacity-100 font-bold text-lg"
                >
                    ✕
                </button>

                {/* Nombre del Proyecto */}
                <h4 className="font-bold text-sm uppercase mb-1 pr-6 truncate">
                    {getNombreProyecto(turno.proyectoId)}
                </h4>
                
                <div className="flex justify-between items-end">
                    <span className="text-xs opacity-90 leading-tight">Acercate al stand <br/>aprox. en:</span>
                    <span className="text-2xl font-bold">{turno.tiempoDeEspera || 15} min</span>
                </div>
                </div>
            );
            })}
        </div>

        {/* --- 2. MODAL DE CONFIRMACIÓN --- */}
        {turnoParaCancelar && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[21px] p-6 text-center max-w-xs w-full shadow-2xl animate-in zoom-in duration-200">
                
                <h3 className="text-lg font-bold text-brand-dark mb-6 font-dm-sans">
                ¿Querés salir de la fila?
                </h3>

                <div className="flex gap-3">
                <Button 
                    onClick={handleConfirmarCancelacion} 
                    className="bg-[#EF0886] hover:bg-pink-700 text-white flex-1 rounded-xl font-bold"
                >
                    Confirmar
                </Button>
                
                <Button 
                    onClick={() => setTurnoParaCancelar(null)} 
                    className="bg-white text-[#EF0886] border-2 border-[#EF0886] hover:bg-pink-50 flex-1 rounded-xl font-bold"
                >
                    Cancelar
                </Button>
                </div>

            </div>
            </div>
        )}
        </>
    );
}