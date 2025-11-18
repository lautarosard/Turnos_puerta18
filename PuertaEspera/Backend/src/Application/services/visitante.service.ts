// src/Application/services/VisitanteService.ts
import jwt from 'jsonwebtoken';
import { IVisitanteRepository } from '../../Domain/repositories/IVisitanteRepository.js';
import { Visitante } from '../../Infrastructure/database/client.js';
import { visitanteLoginResponse } from '../models/Responses/visitanteLoginResponse.js';

export class VisitanteService {
    constructor(private visitanteRepository: IVisitanteRepository) {}

    /**
     * INGRESAR: Crea el visitante y devuelve su sesión (Token)
     */
    async ingresar(nombre: string): Promise<visitanteLoginResponse> {
        
        // 1. Creamos el registro en DB
        const nuevoVisitante = await this.visitanteRepository.create(nombre);

        // 2. Generamos el Token (Identidad Persistente)
        const payload = {
            id: nuevoVisitante.id,
            nombre: nuevoVisitante.nombre,
            rol: 'VISITANTE' 
        };

        const secret = process.env.JWT_SECRET || 'MI_PALABRA_SECRETA';
        
        // Hacemos que este token dure mucho (ej: 24 horas) para que no se le cierre la sesión en el evento
        const token = jwt.sign(payload, secret, { expiresIn: '24h' });

        return {
            token,
            visitante: {
                id: nuevoVisitante.id,
                nombre: nuevoVisitante.nombre
            }
        };
    }
}