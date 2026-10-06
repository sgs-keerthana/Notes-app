import type { Note } from "../types/Note";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onPriorityChange:(id:number,priority:Note["priority"])=>void;
};

function NoteCard({
  note,
  onEdit,
  onDelete,
  onPriorityChange,
}: NoteCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        {note.title}
      </h2>

      <p className="mb-5 whitespace-pre-wrap text-gray-600">
        {note.content}
      </p>
      <div className="mb-5 flex gap-2">
        <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
          {note.priority}
        </span>
      </div>
      <select value={note.priority}onChange={(e)=>onPriorityChange(
        note.id,
        e.target.value as Note["priority"]
      )}
      className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2">
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
      </select>
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