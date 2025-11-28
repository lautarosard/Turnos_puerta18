export interface ProyectoResponse {
    id: string;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    duracionEstimada?: number;
    adminEncargadoId: string;
}