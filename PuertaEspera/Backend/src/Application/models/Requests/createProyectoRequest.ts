// src/Application/models/Requests/createProjectRequest.ts
export interface CreateProjectRequest {
    nombre: string;
    descripcion?: string;
    pa: boolean;
    duracionEstimada?: number;
    imagenUrl?: string;
    capacidadMaxima?: number ;
}