import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../Application/exceptions/AppError.js';

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    
    // 1. Si el error es una de nuestras excepciones controladas
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ 
            message: error.message,
            status: 'error' 
        });
    }

    // 2. Si es un error desconocido (Crash, Bug, DB caída)
    console.error('Error Crítico:', error); // Logueamos para nosotros

    return res.status(500).json({ 
        message: 'Ocurrió un error interno en el servidor',
        status: 'fail'
    });
};