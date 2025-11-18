// src/Domain/repositories/IVisitanteRepository.ts
import { Visitante } from '../../Infrastructure/database/client.js';

export interface IVisitanteRepository {
    create(nombre: string): Promise<Visitante>;
    getById(id: string): Promise<Visitante | null>;
}