// src/API/Controllers/TurnoController.ts
import { Request, Response } from 'express';
import { TurnoService } from '../../Application/services/turnos.service.js';
import { CreateTurnoRequest } from '../../Application/models/Requests/CreateTurnoRequest.js';
import { EstadoTurno } from '../../Infrastructure/database/client.js';

export class TurnoController {
  constructor(private turnoService: TurnoService) {}

  /**
   * POST /api/turnos
   * Acción: VISITANTE solicita un turno
   */
  create = async (req: Request, res: Response) => {
    
    const { proyectoId, visitanteId } = req.body;
    // Obtenemos datos del usuario logueado (del Token)
    const usuarioLogueado = req.user as any;
    console.log("Usuario Logueado (Token):", usuarioLogueado);
    // 2. Obtenemos el ID del visitante del Token (gracias al middleware)
    // Casteamos a 'any' o usamos tu tipo global para acceder a .id
    let idFinalVisitante = usuarioLogueado.id;

    // LÓGICA DE ADMIN:
    // Si el que llama es ADMIN y me manda un ID de visitante, usamos ese.
    // (Asumimos que el Admin previamente creó al visitante con el servicio de Visitantes)
    if (usuarioLogueado.rol === 'ADMIN_PROYECTO' && visitanteId) {
        idFinalVisitante = visitanteId;
    }

    if (!proyectoId) {
        return res.status(400).json({ message: 'El proyectoId es obligatorio' });
    }

    // 3. Llamamos al servicio (que valida límite de 2 turnos y emite WebSocket)
    const nuevoTurno = await this.turnoService.solicitarTurno({
        visitanteId: idFinalVisitante,
        proyectoId: proyectoId
    });

    res.status(201).json(nuevoTurno);
  };

  /**
   * GET /api/turnos/proyecto/:proyectoId
   * Acción: ADMIN ve la lista de turnos de su stand
   */
  getByProject = async (req: Request, res: Response) => {
    const { proyectoId } = req.params;
    
    const turnos = await this.turnoService.getTurnosDeProyecto(proyectoId);
    
    res.status(200).json(turnos);
  };

  /**
   * PATCH /api/turnos/:id/estado
   * Acción: ADMIN llama o finaliza un turno
   */
  changeStatus = async (req: Request, res: Response) => {
    const { id } = req.params; // ID del turno
    const { estado, proyectoId } = req.body; // Nuevo estado y ID del proyecto (para notificar a esa sala)

    // 1. Validamos que el estado sea válido (PENDIENTE, LLAMADO, FINALIZADO...)
    // Object.values devuelve un array con los valores del Enum
    if (!Object.values(EstadoTurno).includes(estado)) {
        return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${Object.values(EstadoTurno).join(', ')}` });
    }

    if (!proyectoId) {
        return res.status(400).json({ message: 'El proyectoId es necesario para notificar el cambio.' });
    }

    // 2. Ejecutamos cambio
    const turnoActualizado = await this.turnoService.cambiarEstado(id, estado, proyectoId);

    res.status(200).json(turnoActualizado);
  }

  getMine = async (req: Request, res: Response) => {
    // El ID viene del token del visitante
    const visitanteId = (req.user as any).id;
    
    const misTurnos = await this.turnoService.getMisTurnos(visitanteId);
    
    res.status(200).json(misTurnos);
  }
}