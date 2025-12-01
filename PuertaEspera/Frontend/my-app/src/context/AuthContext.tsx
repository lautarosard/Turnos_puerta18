import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
// Definimos la forma de nuestro Usuario
interface User {
    id: string;
    nombre: string;
}

// Definimos qué datos y funciones va a tener nuestro contexto
interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Inicializamos leyendo del localStorage para que no se pierda al recargar
    const [token, setToken] = useState<string | null>(localStorage.getItem("token_visitante"));
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("datos_visitante");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("token_visitante", newToken);
        localStorage.setItem("datos_visitante", JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token_visitante");
        localStorage.removeItem("datos_visitante");
    };

    const value = {
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para no tener que hacer useContext(AuthContext) cada vez
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};