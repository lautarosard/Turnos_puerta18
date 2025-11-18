// src/Infrastructure/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'; // Usamos el Request normal
import jwt from 'jsonwebtoken';

// Asegúrate de que este JwtPayload coincida con lo que definiste en tu archivo global
interface JwtPayload {
    id: string;
    email: string;
    rol: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'MI_PALABRA_SECRETA';
        
        // Verificamos el token
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // --- AQUÍ ESTÁ LA MAGIA DE TU CÓDIGO ---
        // Como ya declaraste globalmente que Request tiene 'user',
        // TypeScript no se queja aquí. ¡No hace falta castear nada!
        req.user = decoded; 

        next(); 

    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};