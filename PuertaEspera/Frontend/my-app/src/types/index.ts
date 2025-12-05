// Aquí definimos cómo se ven los datos que vienen del Backend

export type EstadoTurno = 'PENDIENTE' | 'LLAMADO' | 'FINALIZADO' | 'CANCELADO';

export interface Proyecto {
    id: string;
    nombre: string;
    descripcion?: string; // Opcional en DB, pero el front suele recibir string vacío si es null
    ubicacion?: string;
    duracionEstimada?: number;
    capacidadMaxima?: number;
    imagenUrl?: string | null; // Puede venir null si no tiene ícono
    pa?: boolean;
    // Agregamos esto opcional
    adminEncargado?: {
        id: string;
        nombre: string;
        username: string;
    };
}

// Ya que estamos, definimos también el Turno para cuando lo usemos
export interface Turno {
    id: string;
    numero: number;
    estado: EstadoTurno;
    fecha: Date;
    visitanteNombre: string;
    tiempoDeEspera?: number;
    proyectoId: string;
}
