import { create } from "zustand";
import type { Note } from "../types/Note";

//Structure of our Zustand store.
type NoteStore = {
  notes: Note[];
  searchTerm: string;
  category: string;
  actions: {
    // Add a new note to the notes array.
    addNote: (note: Note) => void;

    // Update an existing note.
    updateNote: (
      id: number,
      title: string,
      content: string,
      category: Note["category"],
      priority: Note["priority"]
    ) => void;

    // Delete a note using its ID.
    deleteNote: (id: number) => void;

    // Update the search text.
    setSearchTerm: (value: string) => void;

    // Update the selected category.
    setCategory: (value: string) => void;
  };
};

// CREATE ZUSTAND STORE
export const useNoteStore = create<NoteStore>((set) => ({
  notes: [
    {
      id: 1,
      title: "Learn React",
      content: "Study components, props, state and hooks.",
      category: "Study",
      priority: "High",
    },

    {
      id: 2,
      title: "Learn TypeScript",
      content: "Practice types, interfaces and generics.",
      category: "Study",
      priority: "Medium",
    },
  ],

 // FILTER STATE
  searchTerm: "",
  category: "All",

  actions: {
    // ADD NOTE
    addNote: (note) =>
      set((state) => ({

        notes: [...state.notes, note],
      })),

    // UPDATE NOTE
    updateNote: (id, title, content, category, priority) =>

      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id
            ? {
                ...note,
                title,
                content,
                category,
                priority,
              }
            : note
        ),
      })),

    // DELETE NOTE
    deleteNote: (id) =>
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      })),

    // SET SEARCH TERM
    setSearchTerm: (value) =>
      set({
        searchTerm: value,
      }),
   
    // SET CATEGORY
    setCategory: (value) =>
      set({
        category: value,
      }),
  },
}));