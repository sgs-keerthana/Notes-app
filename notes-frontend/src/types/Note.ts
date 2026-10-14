export type Note = {
  id: number;
  title: string;
  content: string;
  category: "Work" | "Study" | "Personal";
  priority: "Low" | "Medium" | "High";
  tenantId: string;
};
export type Tenant={
  id: string;
  name: string;
};
export type PaginatedNotes={
  data: Note[];
  nextCursor: number | null;
  hasMore: boolean;
};