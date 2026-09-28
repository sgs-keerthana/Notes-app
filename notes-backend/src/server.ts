import Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import Joi from "joi";

type Note = {
    id: number;
    title: string;
    content: string;
    category: "Work" | "Study" | "Personal";
    priority: "Low" | "Medium" | "High";
};

let notes: Note[]=[
    {
        id: 1,
        title: "Learn React",
        content: "Study React hooks and components",
        category: "Study",
        priority: "High",
    },
    {
        id: 2,
        title: "Complete Task",
        content: "Finish the backend API task",
        category: "Work",
        priority: "Medium",
    },
];

const noteSchema = Joi.object({
    title: Joi.string().min(3).required(),
    content: Joi.string().min(10).required(),
    category: Joi.string().valid("Work","Study","Personal").required(),
    priority: Joi.string().valid("Low","Medium","High").required(),
});

const idSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});
const server =Hapi.server({
    port: 5000,
    host: "localhost",
    routes:{
        cors: true,
    },
});

server.route({
    method: "GET",
    path: "/notes",

    handler:()=> {
        return notes;
    },
});

server.route({
    method: "POST",
    path: "/notes",

    options: {
       validate:{
        payload: noteSchema,
       },
    },
    handler: (request, h)=>{
        const payload = request.payload as Omit<Note,"id">;

        const newId = notes.length>0 
            ? Math.max(...notes.map((note)=>note.id))+1
            :1;
        const newNote: Note={
            id: newId,
            ...payload,
        };
        notes.push(newNote);
        return h.response(newNote).code(201);
    },
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
    handler: (request,h)=>{
        const id = Number(request.params.id);
        const index = notes.findIndex((note)=>note.id===id);
        if(index===-1) {
            return Boom.notFound("Note not found");
        }
        const payload = request.payload as Omit<Note,"id">;
        const updatedNote: Note={
            id,
            ...payload,
        };
        notes[index]=updatedNote;
        return h.response(updatedNote).code(200);
    },
});

server.route({
    method: "DELETE",
    path: "/notes/{id}",
    options: {
        validate:{params: idSchema,         
        },
    },
    handler: (request,h)=> {
        const id = Number(request.params.id);
        const index=notes.findIndex((note)=>note.id===id);
        if(index === -1){
            return Boom.notFound("Note not found");
        }
        const deletedNote = notes[index];
        notes.splice(index,1);

        return h.response(deletedNote).code(200);
    },
});

const start = async()=>{
    await server.start();

    console.log(`Server running at: ${server.info.uri}`);
};

start();