// src/config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Puerta 18 API - Virtual Queue',
            version: '1.0.0',
            description: 'Documentation for Virtual Queue endpoints',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
    // Buscamos en src (desarrollo) Y en dist (producción/build)
    // Usamos path.join para evitar problemas de rutas en Windows/Linux
    apis: [
        './src/API/Routes/*.ts',
        './src/API/Routes/*.js',
        './dist/API/Routes/*.js'
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app: Express, port: number) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`📘 Documentación disponible en http://localhost:${port}/docs`);
};