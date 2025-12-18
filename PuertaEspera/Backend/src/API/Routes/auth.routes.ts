// src/API/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../Controllers/auth.controller.js';
// 1. Importamos la utilidad
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';
import { authMiddleware } from '../../Infrastructure/middlewares/auth.middleware.js';

export const createAuthRoutes = (controller: AuthController) => {
  const router = Router();

  // 2. ENVOLVEMOS el método del controlador con asyncHandler(...)

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User Login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 user:
   *                   type: object
   *       401:
   *         description: Invalid credentials
   */
  router.post('/login', asyncHandler(controller.login));

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user (Protected)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - nombre
   *               - rol
   *             properties:
   *               nombre:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               rol:
   *                 type: string
   *                 enum: [ADMIN, SUPER_ADMIN]
   *     responses:
   *       201:
   *         description: User registered successfully
   *       403:
   *         description: Forbidden
   */
  router.post('/register', authMiddleware, asyncHandler(controller.register));

  return router;
};