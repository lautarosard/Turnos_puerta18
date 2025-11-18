// src/Infrastructure/database/seed.ts

import 'dotenv/config';
// 1. Importamos el cliente de nuestra base de datos
import { prisma } from './client.js';

// 2. Importamos bcrypt para hashear la contraseña
import bcrypt from 'bcrypt';

// 3. Importamos los Enums (gracias a la exportación en client.ts)
import { RoleUsuario } from './client.js';

// Usamos una función 'async' para poder usar 'await'
async function main() {
    console.log('Iniciando el script de seeding...');

    // --- ¡Define aquí tu primer admin! ---
    const adminEmail = 'admin@proyecto.com';
    const adminPassword = 'admin123'; // La contraseña en texto plano
    // -------------------------------------

    // 4. Hasheamos la contraseña
    const saltRounds = 10; // Factor de seguridad
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    console.log('Contraseña hasheada.');

    // 5. Usamos el cliente Prisma para crear el usuario
    // Usamos 'upsert' (update + insert) para evitar errores
    // si ejecutamos el script varias veces.
    const adminUser = await prisma.usuario.upsert({
        where: { email: adminEmail }, // Busca al usuario por su email
        update: {}, // Si ya existe, no hagas nada
        create: {
        // Si no existe, créalo con estos datos
        email: adminEmail,
        nombre: 'Admin_Principal',
        password: hashedPassword,
        rol: RoleUsuario.ADMIN_PROYECTO,
        },
    });

    console.log('Usuario admin creado o verificado:');
    console.log(adminUser);

    console.log('¡Seeding completado!');
}

// Ejecutamos la función main y manejamos errores
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // 6. Cerramos la conexión a la base de datos
        await prisma.$disconnect();
    });