export interface LoginResponse {
    token: string;
    user: {
        id: string;
        nombre: string;
        username: string;
        rol: string;
    };
}