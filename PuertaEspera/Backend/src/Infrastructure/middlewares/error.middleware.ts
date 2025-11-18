// src/Infrastructure/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error capturado:', error.message); // Log para ti

    // Lógica de traducción de errores
    if (error.message === 'Credenciales inválidas') {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

  // Error genérico por defecto
    res.status(500).json({ message: 'Ocurrió un error interno en el servidor' });
};