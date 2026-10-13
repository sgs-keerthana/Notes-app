import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {ColDef,ICellRendererParams} from "ag-grid-community";
import type { Note } from "../types/Note";
type NotesGridProps = {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onPriorityChange: ( id: number, priority: Note["priority"]) => void;
};
 // Priority Badge
function PriorityRenderer(params: ICellRendererParams<Note>) {
  const priority = params.value as Note["priority"];
  let className ="rounded-full px-3 py-1 text-sm font-medium";
  if (priority === "High") {
    className += " bg-red-100 text-red-700";
  } else if (priority === "Medium") {
    className += " bg-yellow-100 text-yellow-700";
  } else {
    className +=" bg-green-100 text-green-700";
  }
  return (
    <span className={className}>
      {priority}
    </span>
  );
}

  // Actions
type ActionRendererProps = ICellRendererParams<Note> & {
    onEdit: (note: Note) => void;
    onDelete: (id: number) => void;
    onPriorityChange: (id: number,priority: Note["priority"]) => void;
  };

function ActionRenderer({data,onEdit,onDelete,onPriorityChange}: ActionRendererProps) {
  if (!data) {
    return null; }

  let nextPriority: Note["priority"];
    if(data.priority === "Low"){
        nextPriority="Medium";
    } else if (data.priority==="Medium"){
        nextPriority="High";
    } else{
        nextPriority="Low"
    }
  return (
    <div className="flex h-full items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(data)}
        className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => onDelete(data.id)}
        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
      >
        Delete
      </button>

      <button
        type="button"
        onClick={() =>
          onPriorityChange( data.id,nextPriority)
        }
        className="whitespace-nowrap rounded-md bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
      >
        Set {nextPriority}
      </button>
    </div>
  );
}

  // AG Grid
function NotesGrid({
  notes,
  onEdit,
  onDelete,
  onPriorityChange,
}: NotesGridProps) {

  const columnDefs = useMemo< ColDef<Note>[]>(() => [
      {
        field: "title",
        headerName: "Title",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 180,
      },

      {
        field: "content",
        headerName: "Content",
        sortable: true,
        filter: true,
        flex: 2.5,
        minWidth: 250,
        //wrapText: true,
        //autoHeight: true,
      },

      {
        field: "category",
        headerName: "Category",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },

      {
        field: "priority",
        headerName: "Priority",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        cellRenderer: PriorityRenderer,
      },

      {
        headerName: "Actions",
        sortable: false,
        filter: false,
        flex: 2,
        minWidth: 270,
        cellRenderer: ActionRenderer,
        cellRendererParams: {
          onEdit,
          onDelete,
          onPriorityChange,
        },
      },
    ],
    [
      onEdit,
      onDelete,
      onPriorityChange,
    ]
  );

  return (
    <div
      className="ag-theme-quartz w-full"
      style={{
        height: "500px",
      }}
    >
      <AgGridReact<Note>
        rowData={notes}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        animateRows={true}
      />
    </div>
  );
}

export default NotesGrid;
