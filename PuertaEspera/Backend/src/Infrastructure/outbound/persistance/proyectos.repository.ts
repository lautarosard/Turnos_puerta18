// src/Infrastructure/outbound/persistence/PrismaProyectoRepository.ts
import { IProyectoRepository } from '../../../Domain/repositories/IProyectoRepository.js';
import { prisma, Proyecto } from '../../database/client.js';

export class PrismaProyectoRepository implements IProyectoRepository {

    // 1. Renombramos a 'create' a secas
    async create(data: Omit<Proyecto, 'id'>): Promise<Proyecto> {
        return await prisma.proyecto.create({
            data: {
                ...data, // 1. Copiamos nombre, descripción, etc.
                duracionEstimada: data.duracionEstimada ?? 5 // 2. Definimos la duración AQUÍ DENTRO
            }
        });
    }

    async getAll(): Promise<Proyecto[]> {
        return await prisma.proyecto.findMany({
            include: {
                adminEncargado: {
                    select: { id: true, nombre: true, username: true }
                }
            }
        });
    }

    async getById(id: string): Promise<Proyecto | null> {
        return await prisma.proyecto.findUnique({
            where: { id },
            include: {
                adminEncargado: {
                    select: { id: true, nombre: true, username: true } // Traemos nombre e ID
                }
            }
        });
    }

    // 2. Renombramos a 'getByAdminId' (este nombre está bien, es descriptivo)
    async getByAdminId(adminId: string): Promise<Proyecto[]> {
        return await prisma.proyecto.findMany({
            where: {
                adminEncargadoId: adminId
            },
            include: {
                adminEncargado: {
                    select: { id: true, nombre: true, username: true }
                }
            }
        });
    }

    // 3. Renombramos a 'update' y usamos Partial<Proyecto>
    async update(id: string, data: Partial<Proyecto>): Promise<Proyecto> {
        return await prisma.proyecto.update({
            where: { id },
            data: data
        });
    }

    // 4. Renombramos a 'delete'
    async delete(id: string): Promise<Proyecto> {
        return await prisma.proyecto.delete({
            where: { id }
        });
    }

    async exist(name: string): Promise<boolean> {
        return await prisma.proyecto.count({
            where: { nombre: name }
        }) > 0;
    }
}