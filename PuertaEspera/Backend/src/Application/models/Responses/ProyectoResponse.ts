export interface ProyectoResponse {
    id: string;
    nombre: string;
    descripcion?: string;
    pa: boolean;
    duracionEstimada?: number;
    capacidadMaxima?: number;
    adminEncargadoId: string;
    imagenUrl?: string;

}