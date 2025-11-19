// src/Application/services/TurnoService.ts
import { Server } from 'socket.io';
import { ITurnoService } from '../interfaces/IService/ITurnoService.js';
import { ITurnoRepository } from '../../Domain/repositories/ITurnosRepository.js'; 
import { TurnoResponse } from '../models/Responses/turnoResponse.js';
import { Turno, EstadoTurno } from '../../Infrastructure/database/client.js';

export class TurnoService implements ITurnoService {
    constructor(private turnoRepository: ITurnoRepository, private io: Server) {} 
    
    async solicitarTurno(visitanteId: string, proyectoId: string): Promise<TurnoResponse> {
        //validación de turnos
        const validarTurno = await this.turnoRepository.countTurnosActivos(visitanteId);
        if(validarTurno >= 2) {
            throw new Error('Limite alcanzado: Ya tienes 2 turnos en espera');
        }
        
        const turno = await this.turnoRepository.create(
            {
                visitanteId,
                proyectoId
            }
        );

        const response = this.mapToResponse(turno);
        
        this.io.to(proyectoId).emit('nuevo-turno', response);
        
        return response;
    }

    async getTurnosDeProyecto(proyectoId: string): Promise<TurnoResponse[]> {
        const turnos = await this.turnoRepository.getByProyectoId(proyectoId);
        return turnos.map(t => this.mapToResponse(t));
    }

    async cambiarEstado(id: string, estado: EstadoTurno, proyectoId: string): Promise<TurnoResponse> {
        const turno = await this.turnoRepository.updateEstado(id, estado);
        const response = this.mapToResponse(turno);
        this.io.to(proyectoId).emit('turno-actualizado', response);
        return response;
    }

    private mapToResponse(turno: Turno & { visitante?: { nombre: string } | null }): TurnoResponse {
    
    return {
        id: turno.id,
        numero: turno.numero,
        estado: turno.estado,
        fecha: turno.creadoEn,
        proyectoId: turno.proyectoId,
        
        // Ahora TypeScript ya no se queja porque le avisamos arriba que 'visitante' existe
        visitanteNombre: turno.visitante?.nombre || 'Anónimo' 
    };
  }
}