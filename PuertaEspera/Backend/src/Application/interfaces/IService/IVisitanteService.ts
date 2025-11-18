import { visitanteRequest } from "../../models/Requests/visitanteRequest.js"
import { visitanteResponse } from "../../models/Responses/visitanteResponse.js"

export interface IVisitanteService{
    login(VisitanteRequest: visitanteRequest): Promise<visitanteResponse>;

}