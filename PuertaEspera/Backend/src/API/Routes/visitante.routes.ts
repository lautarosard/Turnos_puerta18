// src/API/routes/visitante.routes.ts
import { Router } from 'express';
import { VisitanteController } from '../Controllers/visitante.controller.js';
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';

export const createVisitanteRoutes = (controller: VisitanteController) => {
    const router = Router();

    // POST /api/visitantes/ingresar
    // Pública, cualquiera puede entrar poniendo su nombre
    router.post('/ingresar', asyncHandler(controller.ingresar));

    return router;
};