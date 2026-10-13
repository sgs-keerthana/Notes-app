import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import type { Note } from "../definitions/index.js";
import { getNotesByTenant,createNote as createNoteInDatabase,updateNote as updatedNoteInDatabase,deleteNote as deleteNoteFromDatabase,patchNote as patchNoteInDatabase } from "../db/notesQueries.js";

const getTenantId=(request:Hapi.Request): string | null =>{
  const tenantId=request.headers["x-tenant-id"] as string|undefined;
  if (!tenantId){
    return null;
  }
  return tenantId;
};

export const getNotes = async(request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    return Boom.unauthorized("Tenant ID is required");
  }
  const query = request.query as { cursor?: string; pageSize?:string};
  const cursorVal = query.cursor && query.cursor!=="undefined" && query.cursor!=="null"?Number(query.cursor):null;
  //const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const notesData = await getNotesByTenant(tenantId,isNaN(cursorVal as number)?null:cursorVal,pageSize);
  return h.response(notesData).code(200);
};
export const createNote = async(request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    return Boom.unauthorized("Tenant ID is required");
  }

  const payload = request.payload as Omit<Note, "id" | "tenantId">;
  const newNote = await createNoteInDatabase(payload,tenantId);
  return h.response(newNote).code(201);
};
export const updateNote = async(
    request: Hapi.Request, h: Hapi.ResponseToolkit)=>{
    const tenantId = getTenantId(request);
    if (!tenantId){
        return Boom.unauthorized("Tenant ID is required");
    }
    const id = Number(request.params.id);
    const payload=request.payload as Omit<Note,"id" | "tenantId">;
    const updatedNote = await updatedNoteInDatabase(id,payload,tenantId);
    if(!updatedNote){
      return Boom.notFound("Note not found");
    }
    return h.response(updatedNote).code(200);
};
export const deleteNote = async(request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if(!tenantId){
    return Boom.unauthorized("Tenant ID is required");
  }
  const id = Number(request.params.id);
  const deletedNote= await deleteNoteFromDatabase(id,tenantId);
  if(!deletedNote){
    return Boom.notFound("Note not found");
  }
  return h.response(deletedNote).code(200);
};

export const patchNote=async(request: Hapi.Request,h:Hapi.ResponseToolkit)=>{
  const tenantId=getTenantId(request);
  if(!tenantId){
    return Boom.unauthorized(
      "Tenant ID is requireed"
    );
  }
  const id=Number(request.params.id);
  const payload=request.payload as {priority:Note["priority"];};
  const patchedNote=await patchNoteInDatabase(id,payload.priority,tenantId);
  if(!patchedNote){
    return Boom.notFound("Note not found");
  }
  return h.response(patchedNote).code(200);
};


