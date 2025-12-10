// src/Infrastructure/database/redis.ts
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Verifica que exista la variable
if (!process.env.REDIS_URL) {
    throw new Error('❌ Falta la variable REDIS_URL en el archivo .env');
}

const redis = new Redis(process.env.REDIS_URL, {
    // Estas opciones hacen la conexión más robusta en la nube
    family: 6, // Forzamos IPv6 (necesario a veces en Render/Upstash)
    retryStrategy: (times) => Math.min(times * 50, 2000),
    tls: {
        rejectUnauthorized: false // A veces necesario para evitar errores de certificados SSL
    }
});

redis.on('connect', () => console.log('✅ Conectado a Redis (Upstash)'));
redis.on('error', (err: any) => console.error('❌ Error Redis:', err));
export default redis;