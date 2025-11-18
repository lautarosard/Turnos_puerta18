// src/Domain/repositories/IUsuarioRepository.ts

// 1. Importamos el "POCO" (el tipo Usuario) desde nuestro cliente centralizado.
//    ¡Fíjate que NO importamos PrismaClient!
import { Usuario } from "../../Infrastructure/database/client.js";

// 2. Renombramos a singular (convención)
export interface IUsuarioRepository {
    
    getAll(): Promise<Usuario[]>;

    // 3. Devuelve Usuario o null
    getById(id: string): Promise<Usuario | null>;

    // 4. Devuelve Usuario o null
    findByEmail(email: string): Promise<Usuario | null>;

    // 5. Usamos Omit para decir "un Usuario SIN id"
    create(data: Omit<Usuario, 'id'>): Promise<Usuario>;

    // 6. Usamos Partial para decir "un Usuario con campos opcionales"
    update(id: string, data: Partial<Usuario>): Promise<Usuario>;

    delete(id: string): Promise<Usuario>;
    }