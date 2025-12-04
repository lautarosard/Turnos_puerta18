export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        // Esto es necesario para que 'instanceof' funcione bien en TypeScript al extender de Error
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

// 400 Bad Request: Datos mal formados, faltantes o lógica de negocio simple (ej: "Ya existe el usuario")
export class ClientError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

// 401 Unauthorized: Falló login o no hay token
export class AuthError extends AppError {
    constructor(message: string = 'No autorizado') {
        super(message, 401);
    }
}

// 403 Forbidden: Tiene token, pero no permiso (Roles)
export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso denegado') {
        super(message, 403);
    }
}

// 404 Not Found: No se encontró el recurso
export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado') {
        super(message, 404);
    }
}

// 409 Conflict: Estado actual no permite la acción (ej: Límite de turnos alcanzado)
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}