// src/API/routes/proyecto.routes.ts
import { Router } from 'express';
import { ProyectoController } from '../Controllers/proyecto.controller.js';
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';
import { authMiddleware } from '../../Infrastructure/middlewares/auth.middleware.js';
import { checkRole } from '../../Infrastructure/middlewares/role.middleware.js';

export const createProyectoRoutes = (controller: ProyectoController) => {
    const router = Router();

    // --- RUTAS PÚBLICAS (Visitantes) ---

    // GET /api/proyectos -> Ver todos los stands
    router.get('/', asyncHandler(controller.getAll));

    // GET /api/proyectos/:id -> Ver detalle de un stand
    router.get('/:id', asyncHandler(controller.getById));


    // --- RUTAS PROTEGIDAS (Admins) ---
    // Requieren Header "Authorization: Bearer <token>"

    // POST /api/proyectos -> Crear nuevo proyecto
    router.post('/', authMiddleware, checkRole(['SUPER_ADMIN']), asyncHandler(controller.create));

    // GET /api/proyectos/mis-proyectos -> Ver SOLO los míos
    // (Importante: poner esta ANTES de /:id para que no confunda "mis-proyectos" con un ID)
    router.get('/panel/mis-proyectos', authMiddleware, asyncHandler(controller.getByAdminId));

    // PUT /api/proyectos/:id -> Editar
    router.put('/:id', authMiddleware, asyncHandler(controller.update));

    // DELETE /api/proyectos/:id -> Eliminar
    router.delete('/:id', authMiddleware, asyncHandler(controller.delete));

    return router;
};