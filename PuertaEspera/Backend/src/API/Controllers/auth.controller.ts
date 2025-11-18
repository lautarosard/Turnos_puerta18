// src/API/Controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../../Application/services/auth.service.js';
import { LoginRequest } from '../../Application/models/Requests/loginRequest.js';
import { RegisterRequest } from '../../Application/models/Requests/registerRequest.js';

export class AuthController {
    constructor(private authService: AuthService) {}

    login = async (req: Request, res: Response) => {
    // 1. Casting del request
    const loginRequest = req.body as LoginRequest;

    // 2. Lógica de negocio
    // Si esto falla (throw Error), el asyncHandler lo atrapa y lo manda al middleware.
    const result = await this.authService.login(loginRequest);

    // 3. Respuesta exitosa
    res.status(200).json(result);
    };
    register = async (req: Request, res: Response) => {
        // 1. Casting del body
        const registerRequest = req.body as RegisterRequest;

        // 2. Validar datos básicos (opcional, pero recomendado)
        if (!registerRequest.email || !registerRequest.password || !registerRequest.name) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        // 3. Llamar al servicio
        const nuevoUsuario = await this.authService.register(registerRequest);

        // 4. Responder (201 Created)
        // OJO: Por seguridad, mejor no devolver la password hasheada, pero por ahora devolvemos el objeto.
        res.status(201).json({
            message: 'Usuario creado con éxito',
            user: { id: nuevoUsuario.id, email: nuevoUsuario.email }
        });
    }
}