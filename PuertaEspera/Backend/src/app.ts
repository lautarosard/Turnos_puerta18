// En src/index.js
// 1. Importa dotenv al INICIO de todo
import dotenv from 'dotenv';

// 2. Llama a .config() INMEDIATAMENTE para cargar el .env
dotenv.config();
// 1. Las importaciones de Express ahora traen TIPOS
import express, { Express, Request, Response } from 'express';

//Routes y controllers
import { createAuthRoutes } from './API/Routes/auth.routes.js';
import { AuthController } from './API/Controllers/auth.controller.js';

//Repositories
import { PrismaUsuarioRepository } from './Infrastructure/outbound/persistance/usuario.repository.js';

//Services
import { AuthService } from './Application/services/auth.service.js';


import { errorMiddleware } from './Infrastructure/middlewares/error.middleware.js';
//import { checkRole } from './Infrastructure/middlewares/role.middleware.js'


// 2. Le damos tipo a 'app'. ¡Ahora sabe que es una app de Express!
const app: Express = express();
const PORT: number = 3000; // ¡Ahora 'PORT' tiene tipo!

app.use(express.json());

// A. Instanciamos el Repositorio
const userRepository = new PrismaUsuarioRepository();

// B. Instanciamos el Servicio (inyectando el repositorio)
const authService = new AuthService(userRepository);

// C.  Instanciamos el Controlador (inyectando el servicio)
const authController = new AuthController(authService); 

// D. Instanciamos el controlador a las rutas
const authRouter = createAuthRoutes(authController);

app.use('/api/auth', authRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});