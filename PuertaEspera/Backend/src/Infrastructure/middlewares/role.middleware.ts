// src/Infrastructure/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const checkRole = (rolesPermitidos: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        // req.user ya existe gracias a tu definición global
        if (!req.user || typeof req.user === 'string' || !req.user.rol) {
        return res.status(403).json({ message: 'Acceso denegado (sin rol).' });
        }

        const rolUsuario = req.user.rol; // TS ya sabe que es string

        if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({ message: 'Acceso denegado (rol no autorizado).' });
        }

        next();
    };
};