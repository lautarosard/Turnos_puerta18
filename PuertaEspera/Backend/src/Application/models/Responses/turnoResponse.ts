// src/Application/models/Responses/turnoResponse.ts
import { EstadoTurno } from './../../../Infrastructure/database/client.js';

export interface TurnoResponse {
    id: string;
    numero: number;         // ¡El número bonito (1, 2, 3)!
    estado: EstadoTurno;    // PENDIENTE, LLAMADO, etc.
    fecha: Date;
    visitanteNombre: string; // Para mostrar "Juan" en la pantalla
    proyectoId: string;
}