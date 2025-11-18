// src/Application/AuthService.ts

// 1. Importamos el CONTRATO (Interfaz) del Dominio
import { IUsuarioRepository } from '../../Domain/repositories/IUsuarioRepositories.js';

// 2. Importamos las herramientas de Infraestructura
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 3. Importamos los tipos (DTOs) que necesitamos
import { LoginRequest } from '../models/Requests/loginRequest.js';
import { LoginResponse } from '../models/Responses/loginResponse.js';
import { RegisterRequest } from '../models/Requests/registerRequest.js';
import { UserResponse } from '../models/Responses/UsuarioResponse.js';

export class AuthService {
    // 4. Inyección de Dependencias
    //    El servicio NO sabe si es Prisma o qué.
    //    Solo sabe que necesita "algo" que cumpla con IUsuarioRepository.
    constructor(
        private usuarioRepository: IUsuarioRepository
    ) {}

    /**
     * Lógica del Caso de Uso: Login
     */
    async login(input: LoginRequest): Promise<LoginResponse> {

        // --- Paso 1: Buscar al usuario ---
        const usuario = await this.usuarioRepository.findByEmail(input.email);

        if (!usuario) {
        // Usamos un error genérico por seguridad
        throw new Error('Credenciales inválidas');
        }

        // --- Paso 2: Comparar la contraseña ---
        const esPasswordValida = await bcrypt.compare(input.password, usuario.password);

        if (!esPasswordValida) {
        throw new Error('Credenciales inválidas');
        }

        // --- Paso 3: Crear el Token (JWT) ---
        // El "payload" son los datos que guardamos dentro del token
        const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        };

        // Creamos el token. 'MI_PALABRA_SECRETA' debe ir en tu .env
        // (¡No la dejes "harcodeada" en producción!)
        const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'MI_PALABRA_SECRETA', // <--- ¡Mueve esto al .env!
        {
            expiresIn: '1h', // El token expira en 1 hora
        }
        );

        // --- Paso 4: Devolver el resultado ---
        return {
        token: token,
        user: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
        }
        };
    }
    async register(input: RegisterRequest): Promise<UserResponse> { 
    
        // 1. Validar si ya existe el email
        const existeUsuario = await this.usuarioRepository.findByEmail(input.email);
        if (existeUsuario) {
        throw new Error('El email ya está registrado');
        }

        // 2. Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(input.password, saltRounds);

        // 3. Crear el usuario usando el Repositorio
        const nuevoUsuario = await this.usuarioRepository.create({
        email: input.email,
        nombre: input.name,
        password: hashedPassword,
        rol: 'ADMIN_PROYECTO' // Por defecto los creados serán admins de proyecto
        });

        return {
            id: nuevoUsuario.id,
            name: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        };
    }
}