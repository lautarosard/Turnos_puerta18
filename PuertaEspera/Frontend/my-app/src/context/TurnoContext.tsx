import { createContext, useContext, useState, useEffect  } from "react";
import type { ReactNode } from "react";
import type { Turno } from "./../types";
import { getTurnosActivosUsuario } from "./../services/turnoService"; // Tendremos que crear este endpoint o filtrar
import { useAuth } from "./AuthContext";

interface TurnoContextType {
    turnosActivos: Turno[];
    agregarTurnoLocal: (turno: Turno) => void;
    quitarTurnoLocal: (id: string) => void;
    refrescarTurnos: () => void;
}

const TurnoContext = createContext<TurnoContextType | undefined>(undefined);

export function TurnoProvider({ children }: { children: ReactNode }) {
    const [turnosActivos, setTurnosActivos] = useState<Turno[]>([]);
    const { user } = useAuth(); // Necesitamos saber quién es

    const refrescarTurnos = async () => {
        if (!user) return;
        try {
        // Nota: Necesitarás un endpoint en el back que devuelva "mis turnos activos".
        // Por ahora simularemos que traemos todos y filtramos, o asume que getTurnosActivosUsuario existe.
        const misTurnos = await getTurnosActivosUsuario(); 
        setTurnosActivos(misTurnos);
        } catch (error) {
        console.error("Error cargando turnos", error);
        }
    };

    // Cargar turnos al iniciar o al loguearse
    useEffect(() => {
        refrescarTurnos();
    }, [user]);

    const agregarTurnoLocal = (turno: Turno) => {
        setTurnosActivos(prev => [...prev, turno]);
    };

    const quitarTurnoLocal = (id: string) => {
        setTurnosActivos(prev => prev.filter(t => t.id !== id));
    };

    return (
        <TurnoContext.Provider value={{ turnosActivos, agregarTurnoLocal, quitarTurnoLocal, refrescarTurnos }}>
        {children}
        </TurnoContext.Provider>
    );
}

export const useTurnos = () => {
    const context = useContext(TurnoContext);
    if (!context) throw new Error("useTurnos debe usarse dentro de TurnoProvider");
    return context;
};