import api from './../lib/axios'; // Importamos NUESTRA instancia configurada
import type { Turno, EstadoTurno } from './../types';

export interface TurnoRequest {
    idProyecto: string;
    visitanteId?: string;
}
export interface TurnoResponse {
    id: string;
    numero: number;
    estado: string;
    fecha: Date;
    visitanteNombre: string;
    tiempoDeEspera?: number;
    proyectoId: string;
}

export const solicitarTurno = async (proyectoId: string, visitanteId?: string): Promise<Turno> => {
    const body = { proyectoId, visitanteId };
    const { data } = await api.post<Turno>('/turnos', body);
    return data;
};
export const getTurnosActivosUsuario = async (): Promise<Turno[]> => {
    // No hace falta pasar ID, el backend lo saca del Token que envía Axios automáticamente
    const { data } = await api.get<Turno[]>('/turnos/mis-turnos');
    return data;
};
export const getTurnosDeProyecto = async (proyectoId: string): Promise<Turno[]> => {
    const { data } = await api.get<Turno[]>(`/turnos/proyecto/${proyectoId}`);
    return data;
};

// Función genérica para cambiar estado
export const cambiarEstadoTurno = async (id: string, proyectoId: string, estado: EstadoTurno): Promise<Turno> => {
    const { data } = await api.patch<Turno>(`/turnos/${id}/estado`, {
        estado,
        proyectoId
    });
    return data;
};

export const accionTaller = async (proyectoId: string, accion: 'LLAMAR_TODOS' | 'FINALIZAR_TODOS') => {
    await api.post(`/turnos/${proyectoId}/taller`, { accion });
};

// Wrappers útiles (opcionales, pero hacen el código más legible)
export const cancelarTurno = (id: string, proyectoId: string) => cambiarEstadoTurno(id, proyectoId, 'CANCELADO');
export const finalizarTurno = (id: string, proyectoId: string) => cambiarEstadoTurno(id, proyectoId, 'FINALIZADO');
export const llamarTurno = (id: string, proyectoId: string) => cambiarEstadoTurno(id, proyectoId, 'LLAMADO');