import { Proyecto } from "./../../Infrastructure/database/client.js";

export interface IProyectoRepository {
    create(proyecto: Omit<Proyecto, 'id'>): Promise<Proyecto>;
    getAll(): Promise<Proyecto[]>;
    getByAdminId(id: string): Promise<Proyecto[]>;
    getById(id: string): Promise<Proyecto | null>;
    update(id: string, data: Partial<Proyecto>): Promise<Proyecto | null>;
    delete(id: string): Promise<Proyecto | null>;
    exist(name: string): Promise<boolean>;
}