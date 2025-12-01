// src/API/routes/turno.routes.ts
import { Router } from 'express';
import { TurnoController } from '../Controllers/turnos.controller.js';
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';
import { authMiddleware } from '../../Infrastructure/middlewares/auth.middleware.js';

export const createTurnoRoutes = (controller: TurnoController) => {
  const router = Router();

  // 1. VISITANTE: Sacar Turno
  router.post('/', authMiddleware, asyncHandler(controller.create));

  // 2. ADMIN: Ver lista
  router.get('/proyecto/:proyectoId', authMiddleware, asyncHandler(controller.getByProject));

  router.get('/mis-turnos', authMiddleware, asyncHandler(controller.getMine));
  // 3. ADMIN: Cambiar Estado (Llamar/Finalizar)
  router.patch('/:id/estado', authMiddleware, asyncHandler(controller.changeStatus));

  return router;
};