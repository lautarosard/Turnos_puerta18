import { UserRequest } from "./UsuarioRequest.js";
export interface RegisterRequest extends UserRequest {
    password: string;
}