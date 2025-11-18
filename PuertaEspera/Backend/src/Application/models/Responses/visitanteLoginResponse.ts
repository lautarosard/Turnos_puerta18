export interface visitanteLoginResponse{
    token: string;
    visitante: {
        id: string;
        nombre: string;
    }
}