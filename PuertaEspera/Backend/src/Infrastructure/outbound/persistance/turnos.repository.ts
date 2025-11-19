import { ITurnoRepository } from "../../../Domain/repositories/ITurnosRepository.js";
import { prisma, Turno, EstadoTurno } from "../../database/client.js";

export class PrismaTurnosRepository implements ITurnoRepository {
    async create(data: { visitanteId: string; proyectoId: string }): Promise<Turno> {
        const lastTurn= await prisma.turno.findFirst({
            where: {
                proyectoId: data.proyectoId
            },
            orderBy: {
                numero: "desc"
            }
        });

        const postTurn= (lastTurn?.numero || 0) + 1;

        return await prisma.turno.create({
            data: {
                visitanteId: data.visitanteId,
                proyectoId: data.proyectoId,
                numero: postTurn
            }
        });
    }
    async getByProyectoId(proyectoId: string): Promise<Turno[]> {
       return await prisma.turno.findMany({
        where: { proyectoId },
        include: { visitante: true }, // Importante: traer el nombre del visitante
        orderBy: { creadoEn: 'asc' }
        });
    }
    async countTurnosActivos(visitanteId: string): Promise<number> {
        return await prisma.turno.count({
      where: {
        visitanteId:visitanteId,
        estado: { in: ['PENDIENTE', 'LLAMADO'] } // Cuentan como activos
      }
    });
    }
    async updateEstado(id: string, estado: EstadoTurno): Promise<Turno> {
        return await prisma.turno.update({
        where: { id },
        data: { estado },
        include: { visitante: true }
    });
    }
}
