// src/Application/services/TurnoService.ts
import { Server } from 'socket.io';
import { ITurnoService } from '../interfaces/IService/ITurnoService.js';
import { ITurnoRepository } from '../../Domain/repositories/ITurnosRepository.js';
import { TurnoResponse } from '../models/Responses/turnoResponse.js';
import { Turno, EstadoTurno } from '../../Infrastructure/database/client.js';
import { TurnoRequest } from '../models/Requests/TurnoRequest.js';
import { IProyectoRepository } from '../../Domain/repositories/IProyectoRepository.js';
import { ConflictError } from '../exceptions/AppError.js';
import redis from '../../Infrastructure/database/redis/redis.js';

export class TurnoService implements ITurnoService {
    constructor(
        private turnoRepository: ITurnoRepository,
        private io: Server,
        private proyectoRepository: IProyectoRepository
    ) { }

    async solicitarTurno(request: TurnoRequest): Promise<TurnoResponse> {
        // 1. Validaciones de usuario (Límite de 3 turnos)
        const validarTurno = await this.turnoRepository.countTurnosActivos(request.visitanteId);
        if (validarTurno >= 3) {
            // Asegúrate de tener ConflictError importado o usa Error
            throw new Error('Límite alcanzado: Ya tienes 3 turnos en espera');
        }

        const yaTieneTurno = await this.turnoRepository.existeTurnoActivo(request.visitanteId, request.proyectoId);
        if (yaTieneTurno) {
            throw new Error('Ya tienes un turno activo para este stand.');
        }

        // 2. Validaciones de Proyecto y Cupo
        // Usamos esta variable 'proyectoVerificado' para todo, no la busques de nuevo abajo
        const proyectoVerificado = await this.proyectoRepository.getById(request.proyectoId);

        if (!proyectoVerificado) {
            throw new Error('El proyecto no existe.');
        }

        const genteEnElStand = await this.turnoRepository.countActiveByProject(request.proyectoId);
        // --- 2. GENERAMOS EL NÚMERO CON REDIS (ATÓMICO) ---
        const nuevoNumero = await redis.incr(`counter:${request.proyectoId}`);
        // Si es Taller (>1) y está lleno, rebotamos
        if (proyectoVerificado.capacidadMaxima > 1 && genteEnElStand >= proyectoVerificado.capacidadMaxima) {
            throw new Error(`El cupo para esta función está completo (${proyectoVerificado.capacidadMaxima} personas). Espera a que termine la actividad actual.`);
        }

        // 3. Crear el turno
        const nuevoTurno = await this.turnoRepository.create({
            visitanteId: request.visitanteId,
            proyectoId: request.proyectoId,
            numero: nuevoNumero
        });

        // 4. --- NUEVO CÁLCULO DE TIEMPO ---
        let tiempoEstimado = 0;

        if (proyectoVerificado.capacidadMaxima > 1) {
            // CASO TALLER: El tiempo de espera es fijo (lo que dura la actividad)
            // Todos entran juntos, así que el "próximo" grupo espera la duración total.
            tiempoEstimado = proyectoVerificado.duracionEstimada;
        } else {
            // CASO FILA INDIA: Calculamos cuántos hay antes * duración
            const turnosAntes = await this.turnoRepository.countTurnosPendientesPrevios(
                request.proyectoId,
                nuevoTurno.numero
            );
            tiempoEstimado = turnosAntes * (proyectoVerificado.duracionEstimada ?? 10);
        }

        // 5. Mapear y responder
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

            const tiempo = turnosAntes * (proyecto?.duracionEstimada ?? 10);

            return this.mapToResponse(turno, tiempo);
        }));

        return turnosConTiempo;
    }
    async gestionarTaller(proyectoId: string, accion: 'LLAMAR_TODOS' | 'FINALIZAR_TODOS'): Promise<void> {

        if (accion === 'LLAMAR_TODOS') {
            // Pasamos todos los PENDIENTES a LLAMADOS
            await this.turnoRepository.updateManyStatus(proyectoId, 'PENDIENTE', 'LLAMADO');
        }
        else if (accion === 'FINALIZAR_TODOS') {
            // Pasamos todos los LLAMADOS a FINALIZADOS
            await this.turnoRepository.updateManyStatus(proyectoId, 'LLAMADO', 'FINALIZADO');
        }

        // Emitimos un evento especial de "REFRESCAR TODO" para no mandar 35 notificaciones
        this.io.to(proyectoId).emit('batch-update');
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