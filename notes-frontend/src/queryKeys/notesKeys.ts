export const notesKeys ={
    all: ["notes"] as const,
    detail: (id: number)=> ["notes",id] as const,
};