import { Turno, EstadoTurno } from "./../../Infrastructure/database/client.js";

export interface ITurnoRepository{

    create(data: {visitanteId: string; proyectoId: string}):Promise<Turno>;

    getByProyectoId(proyectoId:string): Promise<Turno[]>;

    findActiveByVisitanteId(visitanteId: string): Promise<Turno[]>;
    countTurnosActivos(visitanteId:String): Promise<number>;

    updateEstado(id:string, estado: EstadoTurno):Promise<Turno>;
    
    countTurnosPendientesPrevios(proyectoId: string, numeroTurno: number): Promise<number>;
}