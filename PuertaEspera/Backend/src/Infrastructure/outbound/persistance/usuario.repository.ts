// src/Infrastructure/outbound/persistence/PrismaUsuarioRepository.ts

// 1. Importamos la Interfaz que definiste en el Domain
// (Asegúrate de ajustar la ruta si moviste la interfaz a Domain como sugerí)
import { IUsuarioRepository } from '../../../Domain/repositories/IUsuarioRepository.js';

// 2. Importamos el cliente 'prisma' y el tipo 'Usuario' desde nuestra config central
import { prisma, Usuario } from '../../database/client.js';

// 3. La clase implementa el contrato
export class PrismaUsuarioRepository implements IUsuarioRepository {

    /**
     * Obtener todos los usuarios
     * SQL: SELECT * FROM Usuario;
     */
    async getAll(): Promise<Usuario[]> {
        return await prisma.usuario.findMany();
    }

    /**
     * Buscar por ID
     * SQL: SELECT * FROM Usuario WHERE id = '...';
     */
    async getById(id: string): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { id: id },
        });
    }

    /**
     * Buscar por Email
     * SQL: SELECT * FROM Usuario WHERE email = '...';
     */
    async findByUsername(username: string): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { username: username },
        });
    }

    /**
     * Crear Usuario
     * SQL: INSERT INTO Usuario (email, nombre...) VALUES (...);
     */
    // Usamos Omit<'id'> porque la DB lo genera
    async create(data: Omit<Usuario, 'id'>): Promise<Usuario> {
        return await prisma.usuario.create({
            data: data,
        });
    }

    /**
     * Actualizar Usuario
     * SQL: UPDATE Usuario SET nombre = ... WHERE id = ...;
     */
    // Usamos Partial para permitir actualizar solo algunos campos
    async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
        return await prisma.usuario.update({
            where: { id: id },
            data: data,
        });
    }

    /**
     * Eliminar Usuario
     * SQL: DELETE FROM Usuario WHERE id = ...;
     */
    async delete(id: string): Promise<Usuario> {
        return await prisma.usuario.delete({
            where: { id: id },
        });
    }
}