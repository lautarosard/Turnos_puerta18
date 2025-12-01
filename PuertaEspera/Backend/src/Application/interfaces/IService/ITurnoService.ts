// src/Application/interfaces/IServices/ITurnoService.ts
import { TurnoResponse } from '../../models/Responses/turnoResponse.js';
import { EstadoTurno } from '../../../Infrastructure/database/client.js';
import { TurnoRequest } from '../../models/Requests/TurnoRequest.js';

export interface ITurnoService {
    // Visitante solicita turno
    solicitarTurno(TurnoRequest: TurnoRequest): Promise<TurnoResponse>;

    // Admin ve lista
    getTurnosDeProyecto(proyectoId: string): Promise<TurnoResponse[]>;
    getMisTurnos(visitanteId: string): Promise<TurnoResponse[]>
    // Admin cambia estado
    cambiarEstado(id: string, estado: EstadoTurno, proyectoId: string): Promise<TurnoResponse>;
}