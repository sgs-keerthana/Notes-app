import type { Note } from "../types/Note";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
};

function NoteCard({
  note,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        {note.title}
      </h2>

      <p className="mb-5 whitespace-pre-wrap text-gray-600">
        {note.content}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => onEdit(note)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default NoteCard;