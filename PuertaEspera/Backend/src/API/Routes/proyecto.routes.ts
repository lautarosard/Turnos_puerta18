// src/API/Routes/proyecto.routes.ts
import { Router } from 'express';
import { ProyectoController } from '../Controllers/proyecto.controller.js';
import { asyncHandler } from '../../Infrastructure/middlewares/async.handler.js';
import { authMiddleware } from '../../Infrastructure/middlewares/auth.middleware.js';
import { checkRole } from '../../Infrastructure/middlewares/role.middleware.js';

export const createProyectoRoutes = (controller: ProyectoController) => {
    const router = Router();

    // --- PUBLIC ROUTES (Visitors) ---

    /**
     * @swagger
     * /api/proyectos:
     *   get:
     *     summary: Get all projects (Stands)
     *     tags: [Projects]
     *     responses:
     *       200:
     *         description: List of projects retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   nombre:
     *                     type: string
     *                   duracionEstimada:
     *                     type: integer
     *                   capacidadMaxima:
     *                     type: integer
     */
    router.get('/', asyncHandler(controller.getAll));

    /**
     * @swagger
     * /api/proyectos/{id}:
     *   get:
     *     summary: Get a project (Stand) by ID
     *     tags: [Projects]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Project ID
     *     responses:
     *       200:
     *         description: Project details
     *       404:
     *         description: Project not found
     */
    router.get('/:id', asyncHandler(controller.getById));


    // --- PROTECTED ROUTES (Admins) ---

    /**
     * @swagger
     * /api/proyectos:
     *   post:
     *     summary: Create a new project (Stand) - Requires SuperAdmin
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
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
     *                 example: "Advanced Robotics"
     *               descripcion:
     *                 type: string
     *                 example: "A stand about robots..."
     *               duracionEstimada:
     *                 type: integer
     *                 example: 10
     *               capacidadMaxima:
     *                 type: integer
     *                 example: 5
     *               pa:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       201:
     *         description: Project created successfully
     *       403:
     *         description: You do not have SuperAdmin permissions
     */
    router.post('/', authMiddleware, checkRole(['SUPER_ADMIN']), asyncHandler(controller.create));

    /**
     * @swagger
     * /api/proyectos/panel/mis-proyectos:
     *   get:
     *     summary: View my assigned projects (Admin)
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of my projects
     */
    router.get('/panel/mis-proyectos', authMiddleware, asyncHandler(controller.getByAdminId));

    /**
     * @swagger
     * /api/proyectos/{id}:
     *   put:
     *     summary: Edit an existing project
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the project to edit
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre:
     *                 type: string
     *               duracionEstimada:
     *                 type: integer
     *               capacidadMaxima:
     *                 type: integer
     *               descripcion:
     *                 type: string
     *     responses:
     *       200:
     *         description: Project updated
     */
    router.put('/:id', authMiddleware, asyncHandler(controller.update));

    /**
     * @swagger
     * /api/proyectos/{id}:
     *   delete:
     *     summary: Delete a project
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the project to delete
     *     responses:
     *       200:
     *         description: Project deleted
     */
    router.delete('/:id', authMiddleware, asyncHandler(controller.delete));

    return router;
};