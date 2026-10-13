import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NotesGrid from "./components/NotesGrid";
import NoteForm from "./components/NoteForm";
import type { Note } from "./types/Note";
import type { NoteFormData } from "./schemas/noteSchema";
import { useNoteStore } from "./store/noteStore";
import { fetchNotes, addNote, updateNote, deleteNote, patchNote } from "./api/notesApi";
import { notesKeys } from "./queryKeys/notesKeys";


function App() {
  // Get UI state from Zustand
  const searchTerm = useNoteStore((state) => state.searchTerm);
  const category = useNoteStore((state) => state.category);

  // Get UI actions from Zustand
  const setSearchTerm = useNoteStore((state) => state.actions.setSearchTerm);
  const setCategory = useNoteStore((state) => state.actions.setCategory);

  // Local UI state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // PAGINATION STATE ADDED
  const [pageSize] = useState(10);
  const [cursors,setCursors] = useState<(number | null)[]>([null]);
  const [pageIndex,setPageIndex] = useState(0);
  const cursor=cursors[pageIndex];

  // TanStack Query client
  const queryClient = useQueryClient();

  const { data,isLoading,isError,error} = useQuery({
    queryKey: [...notesKeys.all, "cursor", cursor, pageSize], 
    queryFn: () => fetchNotes(cursor, pageSize),
    placeholderData: (previousData) => previousData
  });
  const notes = data?.data ?? [];
  const nextCursor = data?.nextCursor ?? null;
  const hasMore = data?.hasMore ?? false;

 const handleNextPage=()=>{
  if(!hasMore || nextCursor===null){
    return;
  }
  const nextCursors=[ ...cursors.slice(0,pageIndex+1), nextCursor];
    setCursors(nextCursors);
    setPageIndex((current)=>current+1);
 };

 const handlePreviousPage=()=>{
  if(pageIndex===0){
    return;
  }
  setPageIndex((current)=>current-1);
 };

  // POST /notes & PUT /notes/{id}
  const saveNoteMutation = useMutation({
    mutationFn: async (note: Note | Omit<Note, "id">) => {
      if ("id" in note) {
        return updateNote(note);
      }
      return addNote(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notesKeys.all,
      });
      setEditingNote(null);
      setShowForm(false);
    },
  });

  // PATCH /notes/{id}
  const patchNoteMutation = useMutation({
    mutationFn: patchNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notesKeys.all,
      });
    },
    onError: (error) => {
      console.error("PATCH ERROR:", error);
    },
  });

  // DELETE /notes/{id}
  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notesKeys.all,
      });
    },
  });

  // Save note handler
  const handleSave = (note: NoteFormData) => {
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
    saveNoteMutation.mutate({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
    });
  };

  // Edit note handler
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  // Delete note handler
  const handleDelete = (id: number) => {
    deleteNoteMutation.mutate(id);
  };

  // Priority change handler
  const handlePriorityChange = (id: number, priority: Note["priority"]) => {
    patchNoteMutation.mutate({
      id, changes: { priority },
    });
  };
   
  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = note.title.toLowerCase().includes(search) || note.content.toLowerCase().includes(search);
      const matchesCategory = category === "All" || note.category === category;
      return (matchesSearch && matchesCategory);
    });
  }, [notes, searchTerm, category]);

  // Loading Layout
  if (isLoading) {
    return <div className="p-10 text-center">Loading notes...</div>;
  }

  // Error Layout
  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        {error instanceof Error ? error.message : "Failed to fetch notes"}
      </div>
    );
  }

  // UI Layout
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header Section */}
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

        {/* Search Bar Section */}
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/* Category Filters Section */}
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

        {/* Data Display & Grid Section */}
        {filteredNotes.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">No notes found.</p>
          </div>
        ) : (  
          <NotesGrid
            notes={filteredNotes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPriorityChange={handlePriorityChange}
          />
        )}

        {/* PAGINATION BUTTONS SECTION ADDED */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {pageIndex+1}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={!hasMore||isLoading}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Form Dialog Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            setEditingNote(null);
            setShowForm(false);
          }}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
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