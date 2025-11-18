// src/API/Controllers/VisitanteController.ts
import { Request, Response } from 'express';
import { VisitanteService } from '../../Application/services/visitante.service.js';

export class VisitanteController {
    constructor(private visitanteService: VisitanteService) {}

    ingresar = async (req: Request, res: Response) => {
        // Esperamos un body: { "nombre": "Juan" }
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es obligatorio' });
        }

        const response = await this.visitanteService.ingresar(nombre);

        res.status(201).json(response);
    };
}