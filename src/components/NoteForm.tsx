import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import noteSchema,{type NoteFormData,} from "../schemas/noteSchema";
import type { Note } from "../types/Note";

type NoteFormProps = {
  editingNote: Note | null;
  onSave: (title: string, content: string, category: Note["category"], priority: Note["priority"]) => void;
  onCancel: () => void;
};

function NoteForm({
  editingNote,
  onSave,
  onCancel,
}: NoteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });
  useEffect(() => {
    if (editingNote) {
      reset({
        title: editingNote.title,
        content: editingNote.content,
        category: editingNote.category,
        priority: editingNote.priority,
      });
    } else {
      reset({
        title: "",
        content: "",
        category: "Study",
        priority: "Medium",
      });
    }
  }, [editingNote, reset]);

  const onSubmit = (data: NoteFormData) =>{
    onSave(
      data.title,
      data.content,
      data.category,
      data.priority
    );
    reset();
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className= "mb-5 flex items-center justify-between">
          <h2 className= "text-xl font-semibold text-gray-800">
            {editingNote ? "Edit Note" : "New Note"}
          </h2>

          <button
            type="button"
            onClick={onCancel}
            className="text-2xl text-gray-400 hover:text-gray-600">
               ×
            </button>
            </div>

            {/* TITLE*/}
            <input
              type="text"
              placeholder="Note title"
              {...register("title")}
              className="mb-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"/>

              {errors.title && (
                <p className="mb-4 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}

              {/* CONTENT */}
              <textarea
                placeholder="Write your note..."
                {...register("content")}
                rows={5}
                className="mb-1 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"/>

                {errors.content &&(
                  <p className="mb-4 text-sm text-red-500">
                    {errors.content.message}
                  </p>
                )}

                {/* CATEGORY */}
                <select
                  {...register("category")}
                  className="mb-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500">
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Personal">Personal</option>
                  </select>

                  {errors.category &&(
                    <p className="mb-4 text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}

                  {/* PRIORITY */}
                  <select
                    {...register("priority")}
                    className="mb-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    {errors.priority &&(
                      <p className="mb-4 text-sm text-red-500">
                        {errors.priority.message}
                      </p>
                    )}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-300">
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="rounded-lg bg-blue-500 px-5 py-2.5 font-medium text-white hover:bg-blue-600">
                             {editingNote ? "Update Note" : "Save Note"}
                          </button>
                    </div>
                    
      </form>
  );
}
export default NoteForm;