import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import type { Note } from "../definitions/index.js";
import { notes } from "../data/notess.js";

const checkTenant = (request: Hapi.Request) => {
  const tenantId = request.headers["x-tenant-id"];

  if (!tenantId) {
    return Boom.unauthorized("Tenant ID is required");
  }
  return null;
};
export const getNotes = (request: Hapi.Request) => {
  const tenantError = checkTenant(request);
  if (tenantError) {
    return tenantError;
  }
  return notes;
};
export const createNote = (request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantError = checkTenant(request);
  if (tenantError) {
    return tenantError;
  }
  const payload = request.payload as Omit<Note, "id">;
  const newId = notes.length > 0
      ? Math.max( ...notes.map((note) => note.id)) + 1: 1;
  const newNote: Note = { id: newId,...payload,
  };
  notes.push(newNote);
  return h .response(newNote) .code(201);
};
export const updateNote =(
    request: Hapi.Request, h: Hapi.ResponseToolkit)=>{
    const tenantError = checkTenant(request);
    if (tenantError){
        return tenantError;
    }
    const id = Number(request.params.id);
    const index = notes.findIndex((note)=>note.id===id);
    if(index === -1){
        return Boom.notFound("Note not Found");
    }
    const payload=request.payload as Omit<Note,"id">;
    const updatedNote: Note={id,...payload};
    notes[index]=updatedNote;
    return h.response(updateNote).code(200);
};
export const deleteNote = (request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantError = checkTenant(request);
  if(tenantError){
    return tenantError;
  }
  const id = Number(request.params.id);
  const index=notes.findIndex((note)=>note.id===id);
  if (index === -1){
    return Boom.notFound("Note not found");
  }
  const deletedNote=notes[index];
  notes.splice(index,1);
  return h.response(deletedNote).code(200);
};

