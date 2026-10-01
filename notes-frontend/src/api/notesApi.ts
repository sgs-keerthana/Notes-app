import type { Note } from "../types/Note";

const API_URL = import.meta.env.VITE_API_URL;
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

//Get /notes
export const fetchNotes = async ():Promise<Note[]> =>{
    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            "x-tenant-id": TENANT_ID,
        },
    });
    if(!response.ok){
        throw new Error("Failed to fetch notes");
    }
    return response.json();
};

// Post /notes
export const addNote = async (note: Omit<Note, "id">): Promise<Note>=>{
    const response = await fetch(API_URL,{
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "x-tenant-id": TENANT_ID,
        },
        body : JSON.stringify({
            title: note.title,
            content: note.content,
            category: note.category,
            priority: note.priority,
        }),
    });
    if(!response.ok){
        throw new Error("Failed to create a note");
    }
    return response.json();
};

// PUT /notes{id}
export const updateNote = async (note: Note): Promise<Note>=>{
    const response=await fetch(`${API_URL}/${note.id}`,
        {
            method: "PUT",
            headers:{
                "Content-Type":"application.json",
                "x-tenant-id": TENANT_ID,
            },
            body: JSON.stringify({
                title: note.title,
                content: note.content,
                category: note.category,
                priority: note.priority,
            }),
        });
        if(!response.ok){
            throw new Error("Failed to update a note");
        }
        return response.json();
};

// DELETE /notes{id}
export const deleteNote = async(id: number):Promise<Note>=>{
    const response = await fetch(`${API_URL}/${id}`,
        {
            method: "DELETE",
            headers: {
                "x-tenant-id" : TENANT_ID
            },
        });
        if(!response.ok){
            throw new Error("Failed to delete a note");
        }
        return response.json();
};