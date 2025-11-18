// Esto "aumenta" la definición de tipos de Express
import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        export interface Request {
        // Le decimos a TypeScript que 'req' puede tener 'user'
        // que será el payload del JWT (o string, si lo prefieres)
            user?: string | JwtPayload;
        }
        
    }
}

// Exportamos 'void' para que TS lo trate como un módulo
export {};