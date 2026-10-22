import { getNotes,createNote,updateNote,deleteNote,patchNote } from "../handlers/notes.js";
import type Hapi from "@hapi/hapi";
import { noteSchema,idSchema,patchNoteSchema, cursorpaginationQuerySchema,createTenantSchema} from "../validators/valid.js";
import { getTenants,createTenant } from "../handlers/tenants.js";
import { register,login} from "../handlers/auth.js";
import { loginSchema, registerSchema } from "../validators/auth.js";
export const registerNoteRoutes=( server: Hapi.Server)=>{
    server.route({
        method: "POST",
        path: "/auth/register",
        options:{auth: false,validate:{payload:registerSchema}},
        handler: register,
    });
    server.route({
        method: "POST",
        path:"/auth/login",
        options:{auth:false,validate:{payload:loginSchema}},
        handler:login,
    });
    server.route({
        method: "GET",
        path: "/tenants",
        options: {auth:"jwt"},
        handler: getTenants,
    });

    server.route({
        method: "POST",
        path: "/tenants",
        options:{ auth: "jwt", validate:{payload: createTenantSchema},
        },
        handler: createTenant
    });
    server.route({
        method: "GET",
        path: "/notes",
        options:{ auth:"jwt",validate:{ query: cursorpaginationQuerySchema
        },
    },
        handler: getNotes,
    });
    server.route({
        method: "POST",
        path: "/notes",
        options: { auth: "jwt",
            validate:{
                payload: noteSchema,
            },
        },
        handler: createNote,
    });
    server.route({
        method: "PUT",
        path: "/notes/{id}",
        options:{ auth:"jwt",
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
        options: { auth: "jwt",
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
        options:{ auth: "jwt",
            validate:{
                params: idSchema,
            },
        },
        handler: deleteNote,
    });
};
