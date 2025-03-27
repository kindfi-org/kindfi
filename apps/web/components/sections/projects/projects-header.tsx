import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

interface ProjectsHeaderProps {
  title: string;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export function ProjectsHeader({
  title,
  viewMode = "grid",
  onViewModeChange,
}: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          <button
            type="button"
            className={`p-2 ${
              viewMode === "grid" ? "bg-gray-100" : "bg-white"
            }`}
            onClick={() => onViewModeChange?.("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-5 w-5 text-gray-700" />
          </button>
          <button
            type="button"
            className={`p-2 ${
              viewMode === "list" ? "bg-gray-100" : "bg-white"
            }`}
            onClick={() => onViewModeChange?.("list")}
            aria-label="List view"
          >
            <List className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}
