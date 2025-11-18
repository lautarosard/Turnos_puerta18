// src/Application/models/Requests/createProjectRequest.ts
export interface CreateProjectRequest {
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
}