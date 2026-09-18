import { useEffect, useState } from "react";
import type { Note } from "../types/Note";

type NoteFormProps = {
  editingNote: Note | null;
  onSave: (title: string, content: string, category: string) => void;
  onCancel: () => void;
};

function NoteForm({
  editingNote,
  onSave,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Study");
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategory(editingNote.category);
    } else {
      setTitle("");
      setContent("");
      setCategory("Study");
    }
  }, [editingNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    onSave(title, content, category);

    setTitle("");
    setContent("");
    setCategory("Study");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        {editingNote ? "Edit Note" : "New Note"}
      </h2>

      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />

      <textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="mb-4 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />
      <select
        value={category}
        onChange={(e)=>
          setCategory(e.target.value)
        }
        className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="Work">
            Work
          </option>
          <option value="Study">
            Study
          </option>
          <option value="Personal">
            Personal
          </option>
        </select>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-5 py-2.5 font-medium text-white hover:bg-blue-600"
        >
          {editingNote ? "Update Note" : "Save Note"}
        </button>

        {editingNote && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default NoteForm;