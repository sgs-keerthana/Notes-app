import { z } from "zod";
const noteSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    category: z.enum(["Work","Study","Personal"]),
    priority: z.enum(["Low","Medium","High"]),
    content: z.string().min(10, "Content must be atleast 10 characters"),
})
.strict();

export type NoteFormData = z.infer<typeof noteSchema>;
export default noteSchema;