// src/services/visitanteService.ts
import api from './../lib/axios'; // Importamos NUESTRA instancia configurada

export interface VisitanteResponse {
  token: string;
  visitante: {
    id: string;
    nombre: string;
  };
}

export const ingresarVisitante = async (nombre: string): Promise<VisitanteResponse> => {
  // Axios ya sabe que la URL base es la de Render.
  // Solo ponemos la parte final de la ruta.
  const { data } = await api.post<VisitanteResponse>('/visitantes/ingresar', { nombre });
  
  return data;
};