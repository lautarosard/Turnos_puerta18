import api from './../lib/axios'; // Importamos NUESTRA instancia configurada

export interface ProyectoResponse {
    id: string;
    nombre: string;
    descripcion?: string;
    pa?: boolean;
    duracionEstimada: number;
    imagenUrl?: string | null;
}

export interface CreateProjectRequest {
    nombre: string;
    descripcion?: string;
    pa?: boolean;
    duracionEstimada?: number;
    imagenUrl?: string | null;
}

export interface UpdateProjectRequest {
    nombre?: string;
    descripcion?: string;
    adminEncargadoId?: string; // <--- Importante
    pa?: boolean;
}

export const crearProyecto = async (data: CreateProjectRequest): Promise<ProyectoResponse> => {
    const payload = { ...data, pa: data.pa ?? false };
    const { data: proyecto } = await api.post<ProyectoResponse>('/proyectos', payload);
    return proyecto;
};

export const getProyectos = async (): Promise<ProyectoResponse[]> => {
    const { data: proyectos } = await api.get<ProyectoResponse[]>('/proyectos');
    return proyectos;
};

export const updateProyecto = async (id: string, data: UpdateProjectRequest): Promise<ProyectoResponse> => {
    const { data: proyecto } = await api.put<ProyectoResponse>(`/proyectos/${id}`, data);
    return proyecto;
};