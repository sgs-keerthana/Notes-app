import type {Note,Tenant,PaginatedNotes,} from "../types/Note";

const API_URL = import.meta.env.VITE_API_URL as string;
const API_BASE_URL = API_URL.replace(/\/notes\/?$/, "");
const TENANTS_URL = `${API_BASE_URL}/tenants`;

const tenantHeaders = (tenantId: string) => ({
  "Content-Type": "application/json",
  "x-tenant-id": tenantId,
});

// GET /tenants
export const fetchTenants = async (): Promise<Tenant[]> => {
  const response = await fetch(TENANTS_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch tenants");
  }
  return response.json();
};

// GET /notes
export const fetchNotes = async ( tenantId: string,cursor: number | null,pageSize: number): Promise<PaginatedNotes> => {
  const params = new URLSearchParams({pageSize: String(pageSize),
  });
  if (cursor !== null) {
    params.set("cursor", String(cursor));
  }
  const response = await fetch(`${API_URL}?${params.toString()}`, {
    method: "GET",
    headers: tenantHeaders(tenantId),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
};

// POST /notes
export const addNote = async (note: Omit<Note, "id" | "tenantId">,tenantId: string): Promise<Note> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: tenantHeaders(tenantId),
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error("Failed to create a note");
  }

  return response.json();
};

// PUT /notes/{id}
export const updateNote = async (note: Omit<Note, "tenantId">,tenantId: string): Promise<Note> => {
  const response = await fetch(`${API_URL}/${note.id}`, {
    method: "PUT",
    headers: tenantHeaders(tenantId),
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update a note");
  }
  return response.json();
};

// PATCH /notes/{id} 
export const patchNote = async ({  id,  priority, tenantId,}: {
  id: number;
  priority: Note["priority"];
  tenantId: string;}): Promise<Note> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: tenantHeaders(tenantId),
    body: JSON.stringify({ priority }),
  });

  if (!response.ok) {
    throw new Error("Failed to update note priority");
  }
  return response.json();
};

// DELETE /notes/{id}
export const deleteNote = async (id: number,tenantId: string): Promise<Note> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: tenantHeaders(tenantId),
  });

  if (!response.ok) {
    throw new Error("Failed to delete a note");
  }
  return response.json();
};
