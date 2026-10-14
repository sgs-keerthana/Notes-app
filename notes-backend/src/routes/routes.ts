import { getNotes,createNote,updateNote,deleteNote,patchNote } from "../handlers/notes.js";
import type Hapi from "@hapi/hapi";
import { noteSchema,idSchema,patchNoteSchema, cursorpaginationQuerySchema,createTenantSchema} from "../validators/valid.js";
import { getTenants,createTenant } from "../handlers/tenants.js";
export const registerNoteRoutes=( server: Hapi.Server)=>{
    server.route({
        method: "GET",
        path: "/tenants",
        handler: getTenants,
    });

    server.route({
        method: "POST",
        path: "/tenants",
        options:{
            validate:{payload: createTenantSchema},
        },
        handler: createTenant
    });
    server.route({
        method: "GET",
        path: "/notes",
        options:{
            validate:{
            query: cursorpaginationQuerySchema
        },
    },
        handler: getNotes,
    });
    server.route({
        method: "POST",
        path: "/notes",
        options: {
            validate:{
                payload: noteSchema,
            },
        },
        handler: createNote,
    });
    server.route({
        method: "PUT",
        path: "/notes/{id}",
        options:{
            validate:{
                params: idSchema,
                payload: noteSchema,
            },
        },
        handler: updateNote,
    });
    server.route({
        method: "PATCH",
        path: "/notes/{id}",
        options: {
            validate:{
                params: idSchema,
                payload: patchNoteSchema,
            },
        },
        handler: patchNote,
    });
    server.route({
        method: "DELETE",
        path: "/notes/{id}",
        options:{
            validate:{
                params: idSchema,
            },
        },
        handler: deleteNote,
    });
};
