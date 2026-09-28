export type Note = {
  id: number;
  title: string;
  content: string;
  category: "Work" | "Study" | "Personal";
  priority: "Low" | "Medium" | "High";
};