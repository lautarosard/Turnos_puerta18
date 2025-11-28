// En src/index.js
// 1. Importa dotenv al INICIO de todo
import dotenv from 'dotenv';

import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

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
import { PrismaProyectoRepository } from './Infrastructure/outbound/persistance/proyectos.repository.js';
import { ProyectoService } from './Application/services/proyecto.service.js';
import { ProyectoController } from './API/Controllers/proyecto.controller.js';
import { createProyectoRoutes } from './API/Routes/proyecto.routes.js';
import { PrismaVisitanteRepository } from './Infrastructure/outbound/persistance/visitante.repository.js';
import { VisitanteService } from './Application/services/visitante.service.js';
import { VisitanteController } from './API/Controllers/visitante.controller.js';
import { createVisitanteRoutes } from './API/Routes/visitante.routes.js';
import { PrismaTurnosRepository } from './Infrastructure/outbound/persistance/turnos.repository.js';
import { TurnoService } from './Application/services/turnos.service.js';
import { TurnoController } from './API/Controllers/turnos.controller.js';
import { createTurnoRoutes } from './API/Routes/turnos.routes.js';
//import { checkRole } from './Infrastructure/middlewares/role.middleware.js'

// 2. Le damos tipo a 'app'. ¡Ahora sabe que es una app de Express!
const app: Express = express();
const PORT: number = 3000; // ¡Ahora 'PORT' tiene tipo!

// Envovlemos la app de Express en un servidor HTTP nativo
const httpServer = createServer(app);

// Inicializamos Socket.IO pegándolo a ese servidor
const io = new Server(httpServer, {
    cors: {
        origin: "*", // IMPORTANTE: Permite que tu React (puerto 5173) se conecte al Back (3000)
        methods: ["GET", "POST"]
    }
});

// Escuchamos conexiones (Para probar que funciona)
io.on('connection', (socket) => {
    console.log(`⚡ Cliente conectado a WebSocket: ${socket.id}`);

    // Esto nos servirá para que el admin se una a la sala de SU proyecto
    socket.on('unirse-proyecto', (proyectoId) => {
        socket.join(proyectoId);
        console.log(`Socket ${socket.id} se unió a la sala: ${proyectoId}`);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.use(cors());
app.use(express.json());

// ==========================================
//  INYECCIÓN DE DEPENDENCIAS
// ==========================================

// --- Módulo Auth ---
const userRepository = new PrismaUsuarioRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const authRouter = createAuthRoutes(authController);

// --- Módulo Proyectos  ---
const proyectoRepository = new PrismaProyectoRepository();
const proyectoService = new ProyectoService(proyectoRepository);
const proyectoController = new ProyectoController(proyectoService);
const proyectoRouter = createProyectoRoutes(proyectoController);

//-- Módulo turnos ---
const turnoRepository = new PrismaTurnosRepository();

// ¡OJO AQUÍ! Le pasamos el 'io' que creamos arriba
const turnoService = new TurnoService(turnoRepository, io); 

const turnoController = new TurnoController(turnoService);
const turnoRouter = createTurnoRoutes(turnoController);
// --- Inyección de Visitantes ---
const visitanteRepo = new PrismaVisitanteRepository();
const visitanteService = new VisitanteService(visitanteRepo);
const visitanteController = new VisitanteController(visitanteService);
const visitanteRouter = createVisitanteRoutes(visitanteController);

app.use('/api/auth', authRouter);
app.use('/api/proyectos', proyectoRouter);
app.use('/api/visitantes', visitanteRouter);
app.use('/api/turnos', turnoRouter);
app.use(errorMiddleware);

httpServer.listen(PORT, () => {
    console.log(`Servidor (con Sockets) escuchando en puerto ${PORT}`);
});
export { io };