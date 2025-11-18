import { LoginRequest } from "../../models/Requests/loginRequest.js";
import { LoginResponse } from "../../models/Responses/loginResponse.js";
import { RegisterRequest } from "../../models/Requests/registerRequest.js";
import { UserResponse } from "../../models/Responses/UsuarioResponse.js";

export interface IAuthService {
    login(loginRequest: LoginRequest): Promise<LoginResponse>;
    register(RegisterRequest: RegisterRequest): Promise<UserResponse>;
}