// Importamos los DTOs (Request y Response)
import { CreateProjectRequest } from '../../models/Requests/createProyectoRequest.js';
import { updateProyectoRequest } from '../../models/Requests/updateProyectoRequest.js'; 
import { ProyectoResponse } from '../../models/Responses/ProyectoResponse.js'; 

export interface IProyectoService {
    
    // Agregamos 'adminId' como segundo parámetro
    create(data: CreateProjectRequest, adminId: string): Promise<ProyectoResponse>;
    
    getAll(): Promise<ProyectoResponse[]>;
    
    getByAdminId(adminId: string): Promise<ProyectoResponse[]>; // Renombrado para ser más claro
    
    getById(id: string): Promise<ProyectoResponse | null>;
    
    // Usamos Partial<UpdateProjectRequest> para permitir cambios parciales
    update(id: string, data: Partial<updateProyectoRequest>): Promise<ProyectoResponse | null>;
    
    delete(id: string): Promise<ProyectoResponse | null>;
}