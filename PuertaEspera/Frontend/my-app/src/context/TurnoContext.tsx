import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { io } from "socket.io-client"; 
import type { Turno } from "../types";
import { getTurnosActivosUsuario } from "../services/turnoService";
import { useAuth } from "./AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
const socket = io(SOCKET_URL);

interface TurnoContextType {
    turnosActivos: Turno[];
    refrescarTurnos: () => Promise<void>;
    // AGREGAMOS ESTAS DOS FUNCIONES AL TIPO:
    agregarTurnoLocal: (turno: Turno) => void;
    quitarTurnoLocal: (id: string) => void;
    }

    const TurnoContext = createContext<TurnoContextType | undefined>(undefined);

    export function TurnoProvider({ children }: { children: ReactNode }) {
    const [turnosActivos, setTurnosActivos] = useState<Turno[]>([]);
    const { user } = useAuth();

    const refrescarTurnos = async () => {
        if (!user) return;
        try {
        const misTurnos = await getTurnosActivosUsuario();
        setTurnosActivos(misTurnos);
        } catch (error) {
        console.error("Error cargando turnos", error);
        }
    };

    useEffect(() => {
        refrescarTurnos();
    }, [user]);

    useEffect(() => {
        if (!user || turnosActivos.length === 0) return;

        turnosActivos.forEach(turno => {
        socket.emit('unirse-proyecto', turno.proyectoId);
        });

        const handleUpdate = (turnoActualizado: Turno) => {
        // Si el turno se canceló o finalizó, lo sacamos de la lista
        if (turnoActualizado.estado === 'FINALIZADO' || turnoActualizado.estado === 'CANCELADO') {
            quitarTurnoLocal(turnoActualizado.id);
        } else {
            // Si cambió a LLAMADO u otro, lo actualizamos
            setTurnosActivos(prev => 
            prev.map(t => t.id === turnoActualizado.id ? turnoActualizado : t)
            );
        }
        };

        socket.on('turno-actualizado', handleUpdate);

        return () => {
        socket.off('turno-actualizado', handleUpdate);
        };
    }, [turnosActivos, user]);

    // --- FUNCIONES NUEVAS ---
    const agregarTurnoLocal = (turno: Turno) => {
        setTurnosActivos(prev => [...prev, turno]);
    };

    const quitarTurnoLocal = (id: string) => {
        setTurnosActivos(prev => prev.filter(t => t.id !== id));
    };

    return (
        <TurnoContext.Provider value={{ 
        turnosActivos, 
        refrescarTurnos, 
        agregarTurnoLocal, 
        quitarTurnoLocal 
        }}>
        {children}
        </TurnoContext.Provider>
    );
}

export const useTurnos = () => {
    const context = useContext(TurnoContext);
    if (!context) throw new Error("useTurnos debe usarse dentro de TurnoProvider");
    return context;
};