export interface ProyectoResponse {
    id: string;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    adminEncargadoId: string;
}