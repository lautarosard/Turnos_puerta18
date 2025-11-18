// src/API/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../Controllers/auth.controller.js';
// 1. Importamos la utilidad
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';
import { authMiddleware } from '../../Infrastructure/middlewares/auth.middleware.js';

export const createAuthRoutes = (controller: AuthController) => {
    const router = Router();

  // 2. ENVOLVEMOS el método del controlador con asyncHandler(...)
    router.post('/login', asyncHandler(controller.login));

    router.post('/register', authMiddleware, asyncHandler(controller.register));

    return router;
};