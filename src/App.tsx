import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NoteCard from "./components/NoteCard";
import NoteForm from "./components/NoteForm";
import type { Note } from "./types/Note";

import { useNoteStore } from "./store/noteStore";

function App() {
  // Get all notes from the Zustand store
  const notes = useNoteStore((state) => state.notes);

  // Get the current search text from Zustand
  const searchTerm = useNoteStore((state) => state.searchTerm);

  // Get the currently selected category
  const category = useNoteStore((state) => state.category);

  // Get actions from Zustand
  const addNote = useNoteStore((state) => state.actions.addNote);
  const updateNote = useNoteStore((state) => state.actions.updateNote);
  const deleteNote = useNoteStore((state) => state.actions.deleteNote);

  const setSearchTerm = useNoteStore(
    (state) => state.actions.setSearchTerm
  );

  const setCategory = useNoteStore(
    (state) => state.actions.setCategory
  );

  // Local UI state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);

  // SAVE NOTE
  const handleSave = (
    title: string,
    content: string,
    category: string
  ) => {
    if (editingNote) {
      // Update existing note
      updateNote(
        editingNote.id,
        title,
        content,
        category
      );

      setEditingNote(null);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now(),
        title,
        content,
        category,
      };

      addNote(newNote);
    }

    // Close modal after saving
    setShowForm(false);
  };

  // EDIT NOTE
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  // DELETE NOTE
  const handleDelete = (id: number) => {
    deleteNote(id);
  };

  // FILTER NOTES
  const filteredNotes = notes.filter((note) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      note.title.toLowerCase().includes(search) ||
      note.content.toLowerCase().includes(search);

    const matchesCategory =
      category === "All" || note.category === category;

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
              // New note, so no note is being edited
              setEditingNote(null);

              // Open modal
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
          onSearch={setSearchTerm}
        />


        {/* Category filter buttons */}
        <div className="mb-6 flex gap-3">

          {["All", "Work", "Study", "Personal"].map((item) => (

            <button
              key={item}
              onClick={() => setCategory(item)}

              className={`rounded-lg px-4 py-2 font-medium transition ${
                category === item
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
              }`}
            >
              {item}
            </button>

          ))}

        </div>


        {/* Display notes */}
        {filteredNotes.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">
              No notes found.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2">

            {filteredNotes.map((note) => (

              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

            ))}

          </div>

        )}

      </div>


      {/* New Note / Edit Note Modal */}
      {showForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"

          // Clicking outside the modal closes it
          onClick={() => {
            setEditingNote(null);
            setShowForm(false);
          }}
        >

          <div
            className="w-full max-w-lg"

            // Prevent clicking inside the form from closing the modal
            onClick={(e) => e.stopPropagation()}
          >

            <NoteForm
              editingNote={editingNote}
              onSave={handleSave}

              onCancel={() => {
                setEditingNote(null);
                setShowForm(false);
              }}
            />

          </div>

        </div>

      )}

    </div>
  );
}

export default App;