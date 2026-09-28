import { create } from "zustand";
import type { Note } from "../types/Note";

const API_URL = import.meta.env.VITE_API_URL;
//Structure of our Zustand store.
type NoteStore = {
  notes: Note[];
  searchTerm: string;
  category: string;
  actions: {
    fetchNotes: ()=>Promise<void>;

    // Add a new note to the notes array.
    addNote: (note: Note) =>Promise<void>;

    // Update an existing note.
    updateNote: (
      id: number,
      title: string,
      content: string,
      category: Note["category"],
      priority: Note["priority"]
    ) => Promise<void>;

    // Delete a note using its ID.
    deleteNote: (id: number) => Promise<void>;

    // Update the search text.
    setSearchTerm: (value: string) => void;

    // Update the selected category.
    setCategory: (value: string) => void;
  };
};

// CREATE ZUSTAND STORE
export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  searchTerm: "",
  category: "All",

  actions: {
    fetchNotes: async()=>{
      const response=await fetch(API_URL);
      if(!response.ok){
        throw new Error("Failed to fetch notes");
      }

      const data: Note[]=await response.json();
      set({
        notes: data,
      });
    },
    // POST /notes
    addNote: async (note) => {
      const response = await fetch(API_URL,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          category: note.category,
          priority: note.priority,
        }),
      });
      if(!response.ok) {
        throw new Error("Failed to create note");
      }
      const newNote: Note=await response.json();
      set((state)=>({
        notes:[...state.notes,newNote],
      }));
    },

    // PUT /notes{id}
    updateNote: async(id,title,content,category,priority) => {
      const response = await fetch(`${API_URL}/${id}`,{
        method: "PUT",
        headers: { "Content-Type":"application/json",
        },
        body: JSON.stringify({
          title,content,category,priority
        }),
      });

      if(!response.ok) {
        throw new Error("Failed to update note");
      }

      const updatedNote: Note = await response.json();
      set((state)=>({
        notes: state.notes.map((note)=>
           note.id === id ? updatedNote : note
        ),
      }));
    },

    // DELETE /notes{id}
    deleteNote: async(id)=>{
      const response=await fetch(`${API_URL}/${id}`,{
        method: "DELETE",
      });
      if(!response.ok){
        throw new Error("Failed to delete note");
      }
      set((state)=>({
         notes: state.notes.filter(
          (note) => note.id !== id
         ),
      }));
    },

    // SEARCH
    setSearchTerm: (value) =>
      set({
        searchTerm: value,
      }),

    // CATEGORY
    setCategory: (value) =>
      set({
        category: value,
      }),
  },
}));

