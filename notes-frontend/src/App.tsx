import { useEffect, useMemo, useState } from "react";
import {useMutation,useQuery,useQueryClient,} from "@tanstack/react-query";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NotesGrid from "./components/NotesGrid";
import NoteForm from "./components/NoteForm";
import TenantSelection from "./components/TenantSelection";
import AuthPage from "./components/AuthPage";
import type { Note, Tenant } from "./types/Note";
import type { NoteFormData } from "./schemas/noteSchema";
import type { AuthResponse } from "./api/authApi";
import { useNoteStore } from "./store/noteStore";
import {fetchTenants,fetchNotes,addNote,updateNote,deleteNote,patchNote,} from "./api/notesApi";
import { notesKeys } from "./queryKeys/notesKeys";
const PAGE_SIZE = 10;
function App() {
  const queryClient = useQueryClient();

  // JWT authentication state
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  // Zustand: UI state
  const searchTerm = useNoteStore((state) => state.searchTerm);
  const category = useNoteStore((state) => state.category);

  const setSearchTerm = useNoteStore((state) => state.actions.setSearchTerm);
  const setCategory = useNoteStore((state) => state.actions.setCategory);

  // Currently selected tenant
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Note form state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Cursor pagination state
  const [cursorStack, setCursorStack] = useState<(number | null)[]>([ null,]);
  const [pageIndex, setPageIndex] = useState(0);
  const currentCursor = cursorStack[pageIndex] ?? null;

  // Handle successful login
  const handleLogin = (response: AuthResponse) => {
    localStorage.setItem("authToken", response.token);
    setToken(response.token);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    queryClient.clear();

    setToken(null);
    setSelectedTenant(null);
    setEditingNote(null);
    setShowForm(false);
    setShowDeleteModal(false);
    setNoteToDelete(null);
    setCursorStack([null]);
    setPageIndex(0);
    setSearchTerm("");
    setCategory("All");
  };

  // Handle expired or invalid JWT tokens
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem("authToken");
      queryClient.clear();

      setToken(null);
      setSelectedTenant(null);
      setEditingNote(null);
      setShowForm(false);
      setShowDeleteModal(false);
      setNoteToDelete(null);
      setCursorStack([null]);
      setPageIndex(0);
    };

    window.addEventListener(
      "notes-auth-expired",
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        "notes-auth-expired",
        handleAuthExpired
      );
    };
  }, [queryClient]);

  // Fetch available tenants only after login
  const {
    data: tenants = [], isLoading: tenantsLoading, isError: tenantsIsError, error: tenantsError,} = useQuery({
    queryKey: ["tenants", token],
    queryFn: fetchTenants,
    enabled: Boolean(token),
    retry: false,
  });

  // Fetch notes belonging to the selected tenant
  const { data: notesPage, isLoading: notesLoading, isError: notesIsError, error: notesError,} = useQuery({
    queryKey: [ ...notesKeys.all, selectedTenant?.id ?? null, "cursor", currentCursor, PAGE_SIZE, ],
    queryFn: () => fetchNotes( selectedTenant!.id, currentCursor, PAGE_SIZE),
    enabled: Boolean(token && selectedTenant),
    retry: false,
  });

  // Create or update a note
  const saveNoteMutation = useMutation({
    mutationFn: async (note: NoteFormData & { id?: number }) => {
      if (!selectedTenant) {
        throw new Error("Please select a tenant first");
      }

      if (note.id !== undefined) {
        return updateNote(
          {
            id: note.id,
            title: note.title,
            content: note.content,
            category: note.category,
            priority: note.priority,
          },
          selectedTenant.id
        );
      }

      return addNote(
        {
          title: note.title,
          content: note.content,
          category: note.category,
          priority: note.priority,
        },
        selectedTenant.id
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notesKeys.all,
      });

      setEditingNote(null);
      setShowForm(false);
    },
  });

  // Update note priority
  const patchNoteMutation = useMutation({
    mutationFn: async ({id,priority, }: {
      id: number;
      priority: Note["priority"];
    }) => {
      if (!selectedTenant) {
        throw new Error("Please select a tenant first");
      }

      return patchNote({
        id,
        priority,
        tenantId: selectedTenant.id,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notesKeys.all,
      });
    },
  });

  // Delete a note
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!selectedTenant) {
        throw new Error("Please select a tenant first");
      }
      return deleteNote(id, selectedTenant.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notesKeys.all,
      });
      setShowDeleteModal(false);
      setNoteToDelete(null);
    },
  });

  // Select a tenant and reset pagination
  const handleSelectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCursorStack([null]);
    setPageIndex(0);
    setSearchTerm("");
    setCategory("All");
    setEditingNote(null);
    setShowForm(false);
  };

  // Return to tenant selection
  const handleChangeTenant = () => {
    setSelectedTenant(null);
    setCursorStack([null]);
    setPageIndex(0);
    setEditingNote(null);
    setShowForm(false);
    setShowDeleteModal(false);
    setNoteToDelete(null);
    setSearchTerm("");
    setCategory("All");
  };

  // Save a new or edited note
  const handleSave = (note: NoteFormData) => {
    if (editingNote) {
      saveNoteMutation.mutate({
        ...note,
        id: editingNote.id,
      });
    } else {
      saveNoteMutation.mutate(note);
    }
  };

  // Open the edit form
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  // Open delete confirmation
  const handleDelete = (id: number) => {
    const note = notesPage?.data.find(
      (item) => item.id === id
    );
    if (!note) return;
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  // Confirm note deletion
  const confirmDelete = () => {
    if (!noteToDelete) return;
    deleteNoteMutation.mutate(noteToDelete.id);
  };

  // Cancel deletion
  const cancelDelete = () => {
    if (deleteNoteMutation.isPending) return;
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  // Change note priority
  const handlePriorityChange = (
    id: number,
    priority: Note["priority"]
  ) => {
    patchNoteMutation.mutate({ id, priority });
  };

  // Search and filter notes on the currently loaded page
  const filteredNotes = useMemo(() => {
    const notes = notesPage?.data ?? [];
    const search = searchTerm.toLowerCase();
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search);
      const matchesCategory =
        category === "All" || note.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [notesPage, searchTerm, category]);

  // Show login and registration when no JWT exists
  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Show tenant loading state
  if (tenantsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-center">
        <p>Loading tenants...</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    );
  }

  // Show tenant loading error
  if (tenantsIsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-center">
        <p className="text-red-600">
          {tenantsError instanceof Error
            ? tenantsError.message
            : "Failed to load tenants"}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    );
  }

  // Page 1: tenant selection
  if (!selectedTenant) {
    return (
      <div className="relative min-h-screen">
        <button
          type="button"
          onClick={handleLogout}
          className="fixed right-4 top-4 z-50 rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow hover:bg-red-700"
        >
          Logout
        </button>

        <TenantSelection
          tenants={tenants}
          onSelectTenant={handleSelectTenant}
        />
      </div>
    );
  }

  // Page 2: selected tenant's notes
  return (
    <div className="relative min-h-screen bg-gray-100">
      <button
        type="button"
        onClick={handleLogout}
        className="fixed right-4 top-4 z-50 rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow hover:bg-red-700"
      >
        Logout
      </button>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Header />
            <p className="mt-2 text-sm text-gray-600">
              Workspace:{" "}
              <span className="font-semibold text-gray-900">
                {selectedTenant.name}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleChangeTenant}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Tenant
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setShowForm(true);
              }}
              className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-600"
            >
              + New Note
            </button>
          </div>
        </div>

        <SearchBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
        <div className="mb-6 flex flex-wrap gap-3">
          {["All", "Work", "Study", "Personal"].map((item) => (
            <button
              key={item}
              type="button"
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
        {notesLoading ? (
          <div className="rounded-xl bg-white p-10 text-center">
            Loading notes...
          </div>
        ) : notesIsError ? (
          <div className="rounded-xl bg-white p-10 text-center text-red-600">
            {notesError instanceof Error
              ? notesError.message
              : "Failed to fetch notes"}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              No notes found for this page.
            </p>
          </div>
        ) : (
          <NotesGrid
            notes={filteredNotes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPriorityChange={handlePriorityChange}
          />
        )}

        {/* Cursor pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={pageIndex === 0 || notesLoading}
            onClick={() =>
              setPageIndex((index) => index - 1)
            }
            className="rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pageIndex + 1}
          </span>

          <button
            type="button"
            disabled={!notesPage?.hasMore || notesLoading}
            onClick={() => {
              if (
                notesPage?.nextCursor === null ||
                notesPage?.nextCursor === undefined
              ) {
                return;
              }
              setCursorStack((stack) => [
                ...stack.slice(0, pageIndex + 1),
                notesPage.nextCursor,
              ]);
              setPageIndex((index) => index + 1);
            }}
            className="rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create/edit note modal */}
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
            onClick={(event) => event.stopPropagation()}
          >
            <NoteForm
              editingNote={editingNote}
              onSave={handleSave}
              onCancel={() => {
                setEditingNote(null);
                setShowForm(false);
              }}
            />

            {saveNoteMutation.isError && (
              <p className="mt-2 rounded bg-white p-3 text-sm text-red-600">
                {saveNoteMutation.error instanceof Error
                  ? saveNoteMutation.error.message
                  : "Failed to save the note"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && noteToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onClick={cancelDelete}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-modal-title"
              className="mb-3 text-xl font-semibold text-gray-900"
            >
              Confirm Delete
            </h2>

            <p className="mb-2 text-gray-600">
              Are you sure you want to delete this note?
            </p>

            <p className="mb-6 break-words font-medium text-gray-800">
              {noteToDelete.title}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteNoteMutation.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteNoteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteNoteMutation.isPending
                  ? "Deleting..."
                  : "Confirm Delete"}
              </button>
            </div>

            {deleteNoteMutation.isError && (
              <p className="mt-4 text-sm text-red-600">
                Failed to delete the note. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;