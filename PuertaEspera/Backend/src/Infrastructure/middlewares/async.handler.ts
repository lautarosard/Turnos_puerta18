// src/Infrastructure/middlewares/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Recibe una función asíncrona (el controlador) y asegura que cualquier error
 * se pase automáticamente al siguiente middleware de error (next).
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
    };
};