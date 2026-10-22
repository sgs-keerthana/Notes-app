import type { Note, Tenant, PaginatedNotes,} from "../types/Note";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL as string).replace(/\/+$/, "");

const NOTES_URL = `${API_BASE_URL}/notes`;
const TENANTS_URL = `${API_BASE_URL}/tenants`;

// Prepare headers for authenticated requests
const authHeaders = ( tenantId?: string): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
        headers["x-tenant-id"] = tenantId;
    }
    return headers;
};

// Send requests and handle expired or rejected tokens
const authorizedFetch = async ( url: string, init: RequestInit = {}): Promise<Response> => {
    const headers = {
        ...authHeaders(),
        ...(init.headers as Record<string, string> | undefined),
    };
    const response = await fetch(url, {
        ...init,
        headers,
    });
    if (response.status === 401) {
        localStorage.removeItem("authToken");
        window.dispatchEvent(
            new Event("notes-auth-expired")
        );
    }
    return response;
};

// GET /tenants
export const fetchTenants = async (): Promise<Tenant[]> => {
    const response = await authorizedFetch(TENANTS_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch tenants");
    }
    return response.json();
};

// GET /notes
export const fetchNotes = async (tenantId: string,cursor: number | null,pageSize: number): Promise<PaginatedNotes> => {
    const params = new URLSearchParams({
        pageSize: String(pageSize),
    });
    if (cursor !== null) {
        params.set("cursor", String(cursor));
    }
    const response = await authorizedFetch(
        `${NOTES_URL}?${params.toString()}`,
        {
            method: "GET",
            headers: authHeaders(tenantId),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch notes");
    }
    return response.json();
};

// POST /notes
export const addNote = async (note: Omit<Note, "id" | "tenantId">, tenantId: string): Promise<Note> => {
    const response = await authorizedFetch(NOTES_URL, {
        method: "POST",
        headers: authHeaders(tenantId),
        body: JSON.stringify(note),
    });
    if (!response.ok) {
        throw new Error("Failed to create a note");
    }
    return response.json();
};

// PUT /notes/{id}
export const updateNote = async ( note: Omit<Note, "tenantId">,tenantId: string): Promise<Note> => {
    const response = await authorizedFetch(
        `${NOTES_URL}/${note.id}`,
        {
            method: "PUT",
            headers: authHeaders(tenantId),
            body: JSON.stringify({
                title: note.title,
                content: note.content,
                category: note.category,
                priority: note.priority,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update a note");
    }
    return response.json();
};

// PATCH /notes/{id}
export const patchNote = async ({id,priority,tenantId,}: {
    id: number;
    priority: Note["priority"];
    tenantId: string;
}): Promise<Note> => {
    const response = await authorizedFetch(
        `${NOTES_URL}/${id}`,
        {
            method: "PATCH",
            headers: authHeaders(tenantId),
            body: JSON.stringify({
                priority,
            }),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to update note priority");
    }
    return response.json();
};

// DELETE /notes/{id}
export const deleteNote = async (id: number,tenantId: string): Promise<Note | void> => {
    const response = await authorizedFetch(
        `${NOTES_URL}/${id}`,
        {
            method: "DELETE",
            headers: authHeaders(tenantId),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to delete a note");
    }
    if (response.status === 204) {
        return;
    }
    return response.json();
};