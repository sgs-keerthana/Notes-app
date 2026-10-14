import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import { getTenants as getTenantsFromDatabase,createTenant as createTenantInDatabase} from "../db/notesQueries.js";

export const getTenants=async()=>{
    return getTenantsFromDatabase();
};
export const createTenant=async(request: Hapi.Request,h:Hapi.ResponseToolkit)=>{
    const payload = request.payload as {name: string};
    try{
        const tenant=await createTenantInDatabase(payload.name);
        return h.response(tenant).code(201);
    } catch (error) {
        if (
            error instanceof Error && error.name === "SequelizeUniqueConstraintError"
        ){
            throw Boom.conflict("A tenant with this name already exists");
        }
        throw error;
    }
};