// src/Application/services/ProyectoService.ts

import { IProyectoService } from '../interfaces/IService/IProyectoService.js';
import { IProyectoRepository } from '../../Domain/repositories/IProyectoRepository.js';

// Importamos los DTOs y la Entidad
import { CreateProjectRequest } from '../models/Requests/createProyectoRequest.js';
import { updateProyectoRequest } from '../models/Requests/updateProyectoRequest.js';
import { ProyectoResponse } from '../models/Responses/ProyectoResponse.js';
import { Proyecto } from '../../Infrastructure/database/client.js';
import { ClientError, NotFoundError } from '../exceptions/AppError.js';
import redis from '../../Infrastructure/database/redis/redis.js';


export class ProyectoService implements IProyectoService {
    constructor(private proyectoRepository: IProyectoRepository) { }

    /**
     * CREAR: Aquí es donde ocurre la magia de unir los datos
     */
    async create(data: CreateProjectRequest, adminId: string): Promise<ProyectoResponse> {

        // 1. Validaciones de negocio (opcional)
        if (await this.proyectoRepository.exist(data.nombre)) {
            throw new ClientError('Ya existe un proyecto con ese nombre');
        }
        // 2. Preparamos los datos para el repositorio
        // El repo espera los datos del proyecto + el adminEncargadoId
        const nuevoProyecto = await this.proyectoRepository.create({
            nombre: data.nombre,
            descripcion: data.descripcion || null, // Manejamos opcionales
            pa: data.pa ?? false,
            duracionEstimada: data.duracionEstimada || 0,
            imagenUrl: data.imagenUrl || null,
            capacidadMaxima: data.capacidadMaxima || 1,
            adminEncargadoId: adminId // <--- ¡AQUÍ ASIGNAMOS EL ADMIN!
        });

        // 2. BORRAMOS LA CACHÉ AL CREAR (Para que aparezca el nuevo)
        await redis.del('todos_los_proyectos');
        // 3. Convertimos la Entidad de DB a Response DTO
        return this.mapToResponse(nuevoProyecto);
    }

    /**
   * OBTENER TODOS
   */
    async getAll(): Promise<ProyectoResponse[]> {
        const CACHE_KEY = 'todos_los_proyectos';

        // A. INTENTAMOS LEER DE REDIS
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("⚡ Sirviendo Proyectos desde Redis Cache");
            return JSON.parse(cachedData);
        }
        // B. SI NO HAY CACHÉ, LEEMOS DE LA BASE DE DATOS
        const proyectos = await this.proyectoRepository.getAll();
        // Mapeamos el array entero
        const mappedProjects = proyectos.map(p => this.mapToResponse(p));
        // C. GUARDAMOS EN REDIS
        await redis.set(CACHE_KEY, JSON.stringify(mappedProjects), 'EX', 60);
        return mappedProjects;
    }

    /**
   * OBTENER MIS PROYECTOS
   */
    async getByAdminId(adminId: string): Promise<ProyectoResponse[]> {
        const proyectos = await this.proyectoRepository.getByAdminId(adminId);
        return proyectos.map(p => this.mapToResponse(p));
    }

    /**
   * OBTENER POR ID
   */
    async getById(id: string): Promise<ProyectoResponse | null> {
        const proyecto = await this.proyectoRepository.getById(id);
        if (!proyecto) return null;

        return this.mapToResponse(proyecto);
    }

    /**
   * ACTUALIZAR
   */
    async update(id: string, data: Partial<updateProyectoRequest>): Promise<ProyectoResponse | null> {
        // Nota: Aquí idealmente deberíamos verificar si el usuario es dueño del proyecto
        // antes de actualizar, pero por ahora lo dejamos simple.
        const proyectoActualizado = await this.proyectoRepository.update(id, data);
        if (proyectoActualizado) {
            await redis.del('todos_los_proyectos');
        }
        if (!proyectoActualizado) return null;
        return this.mapToResponse(proyectoActualizado);
    }

    /**
   * ELIMINAR
   */
    async delete(id: string): Promise<ProyectoResponse | null> {
        const proyectoEliminado = await this.proyectoRepository.delete(id);
        if (proyectoEliminado) {
            await redis.del('todos_los_proyectos');
        }
        if (!proyectoEliminado) return null;
        return this.mapToResponse(proyectoEliminado);
    }

    // ==========================================
    //  MÉTODO PRIVADO DE MAPEO (Helper)
    // ==========================================
    // Este método nos ayuda a no repetir código. Convierte la "Entidad" (DB) en "Response" (API)
    private mapToResponse(proyecto: Proyecto): ProyectoResponse {
        return {
            id: proyecto.id,
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion || '', // Convertimos null a string vacío si queremos
            pa: proyecto.pa || false,
            duracionEstimada: proyecto.duracionEstimada,
            imagenUrl: proyecto.imagenUrl || '',
            capacidadMaxima: proyecto.capacidadMaxima,
            adminEncargadoId: proyecto.adminEncargadoId
            // Opcional: Podrías devolver el nombre del admin si tu repo lo trajo (include)
            // adminNombre: (proyecto as any).adminEncargado?.nombre 
        };
    }
}