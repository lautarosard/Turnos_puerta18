// src/Infrastructure/database/client.ts

import { PrismaClient } from '@prisma/client';

// 1. Declaramos una variable global para el cliente
//    Esto es para evitar que se creen múltiples instancias
//    en desarrollo durante la recarga en caliente (hot-reload).
declare global {
    var prisma: PrismaClient | undefined;
}

// 2. Creamos la instancia
//    Si 'global.prisma' ya existe, la reusamos.
//    Si no, creamos una nueva.
export const prisma = global.prisma || new PrismaClient({
    // (Opcional) Habilitar logs para ver qué consultas hace Prisma
    // log: ['query', 'info', 'warn', 'error'],
});

// 3. En producción, nos aseguramos de que solo haya una instancia.
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// 4. Exportamos el cliente y también los enums
//    Así, solo importas desde este archivo y no desde "@prisma/client"
//    en toda tu aplicación.
export * from '@prisma/client';