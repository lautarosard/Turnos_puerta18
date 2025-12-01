import api from './../lib/axios'; // Importamos NUESTRA instancia configurada

export interface ProyectoResponse {
    id: string;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    duracionEstimada: number;
    imagenUrl?: string | null;
}

export interface CreateProjectRequest {
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    duracionEstimada?: number;
    imagenUrl?: string | null;
}

export const crearProyecto = async (data: CreateProjectRequest): Promise<ProyectoResponse> => {
    const { data: proyecto } = await api.post<ProyectoResponse>('/proyectos', data);
    return proyecto;
};

export const getProyectos = async (): Promise<ProyectoResponse[]> => {
    const { data: proyectos } = await api.get<ProyectoResponse[]>('/proyectos');
    return proyectos;
};