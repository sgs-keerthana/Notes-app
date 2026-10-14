import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import type { Note } from "../definitions/index.js";
import { getNotesByTenant, createNote as createNoteInDatabase, updateNote as updateNoteInDatabase, deleteNote as deleteNoteFromDatabase, patchNote as patchNoteInDatabase,tenantExists,} from "../db/notesQueries.js";

const getTenantId = (request: Hapi.Request): string | null => {
  const value = request.headers["x-tenant-id"] as string | undefined;
  return value?.trim() || null;
};
const requireTenant = async (tenantId: string): Promise<void> => {
  if (!(await tenantExists(tenantId))) {
    throw Boom.notFound("Tenant not found");
  }
};

export const getNotes = async (request: Hapi.Request) => {
  const tenantId = getTenantId(request);

  if (!tenantId) {
    throw Boom.unauthorized("Tenant ID is required");
  }
  await requireTenant(tenantId);

  const query = request.query as { cursor?: string; pageSize?: string};
  const cursorVal = query.cursor && query.cursor !== "undefined" && query.cursor !== "null"
    ? Number(query.cursor)
    : null;
  const pageSize = Number(query.pageSize) || 10;

  return getNotesByTenant(
    tenantId,
    cursorVal === null || isNaN(cursorVal) ? null : cursorVal,
    pageSize
  );
};

export const createNote = async (request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    throw Boom.unauthorized("Tenant ID is required");
  }
  await requireTenant(tenantId);
  const payload = request.payload as Omit<Note, "id" | "tenantId">;
  const note = await createNoteInDatabase(payload, tenantId);
  return h.response(note).code(201);
};

export const updateNote = async ( request: Hapi.Request,h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    throw Boom.unauthorized("Tenant ID is required");
  }
  await requireTenant(tenantId);
  const id = Number(request.params.id);
  const payload = request.payload as Omit<Note, "id" | "tenantId">;
  const note = await updateNoteInDatabase(id, payload, tenantId);
  if (!note) {
    throw Boom.notFound("Note not found");
  }
  return h.response(note).code(200);
};

export const deleteNote = async ( request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    throw Boom.unauthorized("Tenant ID is required");
  }
  await requireTenant(tenantId);
  const id = Number(request.params.id);
  const note = await deleteNoteFromDatabase(id, tenantId);
  if (!note) {
    throw Boom.notFound("Note not found");
  }
  return h.response(note).code(200);
};

export const patchNote = async ( request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    throw Boom.unauthorized("Tenant ID is required");
  }
  await requireTenant(tenantId);
  const id = Number(request.params.id);
  const payload = request.payload as {
    priority: Note["priority"];
  };
  const note = await patchNoteInDatabase( id,payload.priority,tenantId);
  if (!note) {
    throw Boom.notFound("Note not found");
  }
  return h.response(note).code(200);
};
