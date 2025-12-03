import api from './../lib/axios';

// Definimos qué responde el backend al loguearnos
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        nombre: string;
        username: string;
        rol: string;
    };
} // 
export interface RegisterRequest {
    username: string;
    nombre: string;
    password: string;
    rol?: string; // Opcional, por defecto el back pone ADMIN_PROYECTO
}

export const loginAdmin = async (username: string, password: string): Promise<LoginResponse> => {
    // Enviamos 'username' porque así lo definimos en el backend nuevo
    const { data } = await api.post<LoginResponse>('/auth/login', {
        username,
        password
    });

    return data;
};

export const registerUser = async (data: RegisterRequest) => {
    // Necesitamos el token porque solo un admin puede crear a otros (ruta protegida)
    const res = await api.post('/auth/register', data);
    return res.data;
};