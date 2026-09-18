import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NoteCard from "./components/NoteCard";
import NoteForm from "./components/NoteForm";
import type { Note } from "./types/Note";

import {useNoteStore} from "./store/noteStore";
function App() {

  // Get all notes from the zustand store
  const notes = useNoteStore(
    (state)=>state.notes
  );

  // Get the current search text from zustand
  const searchTerm = useNoteStore(
    (state)=>state.searchTerm
  );

  // Get the currently selected category
  const category = useNoteStore(
    (state)=> state.category
  );

  // Get the addnote action
  const addNote = useNoteStore(
    (state)=>state.actions.addNote
  );

  // Get the updateNote action.
  const updateNote = useNoteStore(
    (state)=>state.actions.updateNote
  );

  // Get the deleteNote action
  const deleteNote = useNoteStore(
    (state)=>state.actions.deleteNote
  );

  // Get the setSearchTerm action
  const setSearchTerm = useNoteStore(
    (state)=> state.actions.setSearchTerm
  );

  // Get the setCategory action
  const setCategory = useNoteStore(
    (state)=>state.actions.setCategory
  );

  const [editingNote, setEditingNote]=useState<Note | null>(null);
  const [showForm, setShowForm]=useState(false);

  // SAVE NOTE
  const handleSave=(
    title: string,
    content: string,
    category: string
  ) => {
    if (editingNote){
      updateNote(
        editingNote.id,
        title,
        content,
        category
      );
      setEditingNote(null);
    } else {
      const newNote: Note={
        id: Date.now(),
        title,
        content,
        category,
      };

      // Add the new note to Zustand
      addNote(newNote);
    }
    setShowForm(false);
  };

  // EDIT NOTE
  const handleEdit=(note: Note)=>{
    setEditingNote(note);
    setShowForm(true);
  };

  // DELETE NOTE
  const handleDelete =(id: number)=>{
    deleteNote(id);
  };

  // FILTER NOTES
  const filteredNotes = notes.filter((note)=>{
    const search = searchTerm.toLowerCase();
    const matchesSearch = note.title.toLowerCase().includes(search) || note.content.toLowerCase().includes(search);
    const matchesCategory = category === "All" || note.category === category;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Header + New Note button */}
        <div className="flex items-start justify-between">

          <Header />

          <button
            onClick={() => {

              // We are creating a new note,
              // so there should be no editing note.
              setEditingNote(null);

              // Open the form.
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-600"
          >
            + New Note
          </button>

        </div>


        {/* Search box */}
        <SearchBar
          searchTerm={searchTerm}

          // When the user types,
          // update searchTerm in Zustand.
          onSearch={setSearchTerm}
        />


        {/* Category filter buttons */}
        <div className="mb-6 flex gap-3">

          {["All", "Work", "Study", "Personal"].map(
            (item) => (

              <button
                key={item}

                // When clicked,
                // update category in Zustand.
                onClick={() => setCategory(item)}

                className="rounded-lg bg-white px-4 py-2 shadow-sm"
              >
                {item}
              </button>

            )
          )}

        </div>


        {/* Note form */}
        {showForm && (

          <NoteForm
            editingNote={editingNote}

            // Save the note.
            onSave={handleSave}

            // Cancel editing.
            onCancel={() => {
              setEditingNote(null);
              setShowForm(false);
            }}
          />

        )}


        {/* Display notes */}
        {filteredNotes.length === 0 ? (

          // Show this when no note matches
          // the search/category filter.
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">
              No notes found.
            </p>

          </div>

        ) : (

          // Display matching notes.
          <div className="grid gap-5 md:grid-cols-2">

            {filteredNotes.map((note) => (

              <NoteCard
                key={note.id}
                note={note}

                // Edit button
                onEdit={handleEdit}

                // Delete button
                onDelete={handleDelete}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default App;


