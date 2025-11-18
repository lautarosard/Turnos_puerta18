// src/API/Controllers/ProyectoController.ts
import { Request, Response } from 'express';
import { IProyectoService } from '../../Application/interfaces/IService/IProyectoService.js'; // Usamos la interfaz para inyectar
import { CreateProjectRequest } from '../../Application/models/Requests/createProyectoRequest.js'; // Ajusta nombres si es necesario
import { updateProyectoRequest } from '../../Application/models/Requests/updateProyectoRequest.js';

export class ProyectoController {
    // Inyectamos el SERVICIO 
    constructor(private proyectoService: IProyectoService) {}

    /**
     * POST /api/proyectos
     * Crea un proyecto nuevo asignado al usuario logueado
     */
    create = async (req: Request, res: Response) => {
        const request = req.body as CreateProjectRequest;
        
        // Obtenemos el ID del usuario desde el Token (gracias a tu middleware y types globales)
        // Como req.user puede ser string o JwtPayload, hacemos un cast seguro o accedemos directo si TS lo permite
        const adminId = (req.user as any).id; 

        const nuevoProyecto = await this.proyectoService.create(request, adminId);

        res.status(201).json(nuevoProyecto);
    };

    /**
     * GET /api/proyectos
     * Obtiene todos los proyectos (Público)
     */
    getAll = async (req: Request, res: Response) => {
        const proyectos = await this.proyectoService.getAll();
        res.status(200).json(proyectos);
    };

    /**
     * GET /api/proyectos/mis-proyectos
     * Obtiene solo los proyectos del admin logueado
     */
    getByAdminId = async (req: Request, res: Response) => {
        const adminId = (req.user as any).id;
        const misProyectos = await this.proyectoService.getByAdminId(adminId);
        res.status(200).json(misProyectos);
    };

    /**
     * GET /api/proyectos/:id
     */
    getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const proyecto = await this.proyectoService.getById(id);

        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json(proyecto);
    };

    /**
     * PUT /api/proyectos/:id
     */
    update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = req.body as Partial<updateProyectoRequest>;

        // Aquí podríamos validar que el adminId del token sea el dueño del proyecto
        // pero por ahora permitimos la actualización.

        const actualizado = await this.proyectoService.update(id, data);

        if (!actualizado) {
            return res.status(404).json({ message: 'No se pudo actualizar (Proyecto no encontrado)' });
        }

        res.status(200).json(actualizado);
    };

    /**
     * DELETE /api/proyectos/:id
     */
    delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const eliminado = await this.proyectoService.delete(id);

        if (!eliminado) {
            return res.status(404).json({ message: 'No se pudo eliminar' });
        }

        res.status(200).json({ message: 'Proyecto eliminado con éxito', proyecto: eliminado });
    }
}