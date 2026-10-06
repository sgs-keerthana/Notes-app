import { getNotes,createNote,updateNote,deleteNote,patchNote } from "../handlers/notes.js";
import type Hapi from "@hapi/hapi";
import { noteSchema,idSchema,patchNoteSchema } from "../validators/valid.js";

export const registerNoteRoutes=( server: Hapi.Server)=>{
    server.route({
        method: "GET",
        path: "/notes",
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
