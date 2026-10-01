import { useMemo, useState } from "react";
import { useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NoteCard from "./components/NoteCard";
import NoteForm from "./components/NoteForm";
import type { Note } from "./types/Note";
import type { NoteFormData } from "./schemas/noteSchema";
import { useNoteStore } from "./store/noteStore";
import {fetchNotes, addNote, updateNote, deleteNote} from "./api/notesApi";
import { notesKeys } from "./queryKeys/notesKeys";
function App() {
  // Get UI state from Zustand
  const searchTerm = useNoteStore( (state) => state.searchTerm);
  const category = useNoteStore((state) => state.category);

 // Get UI actions from Zustand
  const setSearchTerm = useNoteStore((state) =>state.actions.setSearchTerm);
  const setCategory = useNoteStore((state) => state.actions.setCategory );

  // Local UI state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);

  // TanStack Query client
  const queryClient = useQueryClient();
  // GET /notes
  const {
    data: notes = [],
    isLoading,isError,error,
  } = useQuery({queryKey: notesKeys.all, queryFn: fetchNotes,
  });

  // POST /notes
  // PUT /notes/{id}
  const saveNoteMutation = useMutation({
      mutationFn: async (note: Note | Omit<Note, "id">) => {
        // Editing existing note
        if ("id" in note) {
          return updateNote(note);
        }

        // Creating new note
        return addNote(note);
      },

      onSuccess: () => {

        // Refresh notes data
        queryClient.invalidateQueries({
          queryKey: notesKeys.all,
        });

        setEditingNote(null);
        setShowForm(false);
      },
    });

  // DELETE /notes/{id}
  
  const deleteNoteMutation = useMutation({
      mutationFn: (id:number)=> deleteNote(id),onSuccess: () => {

        // Refresh notes data
        queryClient.invalidateQueries({
          queryKey: notesKeys.all,
        });
      },
    });

  // Save note
  const handleSave = ( note: NoteFormData) => {
    // Editing
    if (editingNote) {
      saveNoteMutation.mutate({
        id: editingNote.id,
        title: note.title,
        content: note.content,
        category: note.category,
        priority: note.priority,
      });

      return;
    }
    // Creating
    saveNoteMutation.mutate({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
    });
  };

  // Edit note
 
  const handleEdit = ( note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  // Delete note

  const handleDelete = ( id: number ) => {
    deleteNoteMutation.mutate(id);
  };

  // Filter notes

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = note.title.toLowerCase().includes(search) || note.content.toLowerCase().includes(search);
      const matchesCategory =category === "All" || note.category === category;
      return (matchesSearch && matchesCategory);
    });
  }, [
    notes,searchTerm,category,
  ]);

  // Loading

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        Loading notes...
      </div>
    );
  }

  // Error
  
  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        {error instanceof Error
          ? error.message
          : "Failed to fetch notes"}
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between">

          <Header />

          <button
            onClick={() => {
              setEditingNote(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-600"
          >
            + New Note
          </button>

        </div>


        {/* Search */}

        <SearchBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />


        {/* Category buttons */}

        <div className="mb-6 flex gap-3">

          {[
            "All",
            "Work",
            "Study",
            "Personal",
          ].map((item) => (

            <button
              key={item}
              onClick={() =>
                setCategory(item)
              }
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


        {/* Notes */}

        {filteredNotes.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">
              No notes found.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2">

            {filteredNotes.map(
              (note) => (

                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />

              )
            )}

          </div>

        )}

      </div>


      {/* Modal */}

      {showForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"

          onClick={() => {
            setEditingNote(null);
            setShowForm(false);
          }}
        >

          <div
            className="w-full max-w-lg"

            onClick={(e) =>
              e.stopPropagation()
            }
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