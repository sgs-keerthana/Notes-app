import { create } from "zustand";
type NoteStore = {
  searchTerm: string;
  category: string;
  actions: {
    // Update the search text.
    setSearchTerm: (value: string) => void;

    // Update the selected category.
    setCategory: (value: string) => void;
  };
};

// CREATE ZUSTAND STORE
export const useNoteStore = create<NoteStore>((set) => ({
  searchTerm: "",
  category: "All",
  actions: {
    // SEARCH
    setSearchTerm: (value) => set({
        searchTerm: value,
      }),

    // CATEGORY
    setCategory: (value) => set({
        category: value,
      }),
  },
}));

