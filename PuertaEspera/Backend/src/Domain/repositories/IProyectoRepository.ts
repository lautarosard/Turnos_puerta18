import { Proyecto } from "./../../Infrastructure/database/client.js";

export interface IProyectoRepository {
    createProyecto(proyecto: Omit<Proyecto, 'id'>): Promise<Proyecto>;
    getProyectos(): Promise<Proyecto[]>;
    getByAdminId(id: string): Promise<Proyecto[]>;
    getProyectoById(id: number): Promise<Proyecto | null>;
    updateProyecto(id: number, proyecto: Proyecto): Promise<Proyecto | null>;
    deleteProyecto(id: number): Promise<Proyecto | null>;
}