// src/Infrastructure/outbound/persistence/PrismaVisitanteRepository.ts
import { IVisitanteRepository } from '../../../Domain/repositories/IVisitanteRepository.js';
import { prisma, Visitante } from '../../database/client.js';

export class PrismaVisitanteRepository implements IVisitanteRepository {
    async create(nombre: string): Promise<Visitante> {
        return await prisma.visitante.create({
        data: { nombre }
        });
    }

    async getById(id: string): Promise<Visitante | null> {
        return await prisma.visitante.findUnique({
        where: { id }
        });
    }
}