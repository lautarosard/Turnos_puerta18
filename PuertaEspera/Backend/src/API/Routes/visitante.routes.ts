// src/API/routes/visitante.routes.ts
import { Router } from 'express';
import { VisitanteController } from '../Controllers/visitante.controller.js';
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';

export const createVisitanteRoutes = (controller: VisitanteController) => {
    const router = Router();

    // POST /api/visitantes/ingresar
    // Pública, cualquiera puede entrar poniendo su nombre
    /**
     * @swagger
     * /api/visitantes/ingresar:
     *   post:
     *     summary: Register visitor entry
     *     tags: [Visitantes]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nombre
     *             properties:
     *               nombre:
     *                 type: string
     *     responses:
     *       200:
     *         description: Visitor registered
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: Guest token
     */
    router.post('/ingresar', asyncHandler(controller.ingresar));

    return router;
};