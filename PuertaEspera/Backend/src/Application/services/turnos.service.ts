// src/Application/services/TurnoService.ts
import { Server } from 'socket.io';
import { ITurnoService } from '../interfaces/IService/ITurnoService.js';
import { ITurnoRepository } from '../../Domain/repositories/ITurnosRepository.js'; 
import { TurnoResponse } from '../models/Responses/turnoResponse.js';
import { Turno, EstadoTurno } from '../../Infrastructure/database/client.js';
import { TurnoRequest } from '../models/Requests/TurnoRequest.js';
import { IProyectoRepository } from '../../Domain/repositories/IProyectoRepository.js';

export class TurnoService implements ITurnoService {
    constructor(
        private turnoRepository: ITurnoRepository, 
        private io: Server,
        private proyectoRepository: IProyectoRepository
        ) {} 
    
    async solicitarTurno(request: TurnoRequest): Promise<TurnoResponse> {
        //validación de turnos
        const validarTurno = await this.turnoRepository.countTurnosActivos(request.visitanteId);
        if(validarTurno >= 2) {
            throw new Error('Limite alcanzado: Ya tienes 2 turnos en espera');
        }
        
        const nuevoTurno = await this.turnoRepository.create(
            {
                visitanteId: request.visitanteId,
                proyectoId: request.proyectoId
            }
        );

        // A. Buscamos el proyecto usando SU repositorio (ya no prisma directo)
        const proyecto = await this.proyectoRepository.getById(request.proyectoId);
        
        // B. Contamos anteriores usando el NUEVO método del repo de turnos
        const turnosAntes = await this.turnoRepository.countTurnosPendientesPrevios(
            request.proyectoId, 
            nuevoTurno.numero
        );

        // C. Matemática
        const tiempoEstimado = turnosAntes * (proyecto?.duracionEstimada || 15);

        // 4. Mapear y responder
        const response = this.mapToResponse(nuevoTurno, tiempoEstimado);
        
        this.io.to(request.proyectoId).emit('nuevo-turno', response);
        
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

    async getMisTurnos(visitanteId: string): Promise<TurnoResponse[]> {
        const turnos = await this.turnoRepository.findActiveByVisitanteId(visitanteId);
        
        // Calculamos el tiempo de espera para cada turno de la lista
        const turnosConTiempo = await Promise.all(turnos.map(async (turno) => {
            const proyecto = await this.proyectoRepository.getById(turno.proyectoId);
            
            const turnosAntes = await this.turnoRepository.countTurnosPendientesPrevios(
                turno.proyectoId, 
                turno.numero
            );
            
            const tiempo = turnosAntes * (proyecto?.duracionEstimada || 15);
            
            return this.mapToResponse(turno, tiempo);
        }));

        return turnosConTiempo;
    }
    private mapToResponse(turno: Turno & { visitante?: { nombre: string } | null }, tiempoEstimado?: number): TurnoResponse {
    
    return {
        id: turno.id,
        numero: turno.numero,
        estado: turno.estado,
        fecha: turno.creadoEn,
        proyectoId: turno.proyectoId,
        tiempoDeEspera: tiempoEstimado,
        // Ahora TypeScript ya no se queja porque le avisamos arriba que 'visitante' existe
        visitanteNombre: turno.visitante?.nombre || 'Anónimo' 
        };
    }
}