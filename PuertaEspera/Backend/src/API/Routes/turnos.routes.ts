// src/API/routes/turno.routes.ts
import { Router } from 'express';
import { TurnoController } from '../Controllers/turnos.controller.js';
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';
import { authMiddleware } from '../../Infrastructure/middlewares/auth.middleware.js';

export const createTurnoRoutes = (controller: TurnoController) => {
  const router = Router();

  // 1. VISITANTE: Sacar Turno (Note: code says authMiddleware is used, so Protected)
  /**
   * @swagger
   * /api/turnos:
   *   post:
   *     summary: Create a new shift (Turno)
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               proyectoId:
   *                 type: string
   *               cantidadIntegrantes:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Shift created successfully
   */
  router.post('/', authMiddleware, asyncHandler(controller.create));

  // 2. ADMIN: Ver lista
  /**
   * @swagger
   * /api/turnos/proyecto/{proyectoId}:
   *   get:
   *     summary: Get shifts by Project ID
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: proyectoId
   *         schema:
   *           type: string
   *         required: true
   *         description: Project ID
   *     responses:
   *       200:
   *         description: List of shifts
   */
  router.get('/proyecto/:proyectoId', authMiddleware, asyncHandler(controller.getByProject));

  /**
   * @swagger
   * /api/turnos/mis-turnos:
   *   get:
   *     summary: Get my assigned shifts
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of my shifts
   */
  router.get('/mis-turnos', authMiddleware, asyncHandler(controller.getMine));

  // 3. ADMIN: Cambiar Estado (Llamar/Finalizar)
  /**
   * @swagger
   * /api/turnos/{id}/estado:
   *   patch:
   *     summary: Change shift status
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Shift ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - estado
   *             properties:
   *               estado:
   *                 type: string
   *                 enum: [PENDIENTE, LLAMANDO, ATENDIDO, CANCELADO]
   *     responses:
   *       200:
   *         description: Status updated
   */
  router.patch('/:id/estado', authMiddleware, asyncHandler(controller.changeStatus));

  // 4. ADMIN: Acciones masivas
  /**
   * @swagger
   * /api/turnos/{proyectoId}/taller:
   *   post:
   *     summary: Bulk actions for workshop shifts
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: proyectoId
   *         schema:
   *           type: string
   *         required: true
   *         description: Project ID
   *     responses:
   *       200:
   *         description: Bulk action completed
   */
  router.post('/:proyectoId/taller', authMiddleware, asyncHandler(controller.tallerActions));

  return router;
};