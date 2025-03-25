"use client";

import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { CategoryFilter } from "~/components/sections/projects";
import { SortDropdown } from "~/components/sections/projects/sort-dropdown";
import type { SortOption } from "~/hooks/use-projects-filter";

/**
 * Props for the ProjectsHeader component
 */
interface ProjectsHeaderProps {
  /** Main title displayed in the header */
  title: string;
  /** Optional description text, this text goes under the sub header e.g on the featured projects page */
  description?: string;
  /** Current view mode - either grid or list */
  viewMode?: "grid" | "list";
  /** Callback triggered when view mode changes */
  onViewModeChange?: (mode: "grid" | "list") => void;
  /** Current sort option */
  sortOption?: SortOption;
  /** Callback triggered when sort option changes */
  onSortChange?: (option: SortOption) => void;
  /** Total number of items being displayed on the ui*/
  totalItems?: number;
  /** Whether to show the sort dropdown menu */
  showSortDropdown?: boolean;
  /** Whether to show the view mode toggle (grid/list) */
  showViewToggle?: boolean;
  /** Whether to show the filter button */
  showFilterButton?: boolean;
  /** Currently selected category filters */
  selectedCategories?: string[];
  /** Optional secondary header text used in featured projects page */
  subHeader?: string;
  /** Callback triggered when filter button is clicked */
  onFilterClick?: () => void;
  /** Function to update selected categories */
  setSelectedCategories?: (x: string[]) => void;
}

export function ProjectsHeader({
  title,
  description,
  viewMode = "grid",
  onViewModeChange,
  sortOption = "popular",
  onSortChange,
  totalItems,
  selectedCategories = [],
  showSortDropdown = true,
  showViewToggle = true,
  showFilterButton = true,
  onFilterClick,
  subHeader,
  setSelectedCategories,
}: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

        <div className="flex items-center gap-3">
          {showViewToggle && viewMode && onViewModeChange && (
            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              <button
                type="button"
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : "bg-white"} transition-colors duration-200`}
                onClick={() => onViewModeChange("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-5 w-5 text-gray-700" />
              </button>
              <button
                type="button"
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : "bg-white"} transition-colors duration-200`}
                onClick={() => onViewModeChange("list")}
                aria-label="List view"
              >
                <List className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          )}

          {showFilterButton && (
            <button
              type="button"
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              onClick={onFilterClick}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter</span>
            </button>
          )}
        </div>
      </div>
      <div className="mt-8 mb-12">
        <CategoryFilter
          selectedCategories={selectedCategories}
          onCategoryToggle={(category: string) => {
            if (selectedCategories.includes(category)) {
              setSelectedCategories?.(
                selectedCategories.filter((id) => id !== category),
              );
            } else {
              setSelectedCategories?.([...selectedCategories, category]);
            }
          }}
        />
      </div>
      <div className="flex max-md:flex-col justify-between items-center mb-8">
        <div>
          {subHeader && <h2 className="text-2xl font-semibold">{subHeader}</h2>}
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {showSortDropdown && onSortChange && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {totalItems && (
                  <button
                    type="button"
                    title="See all projects"
                    className="text-primary-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    See all ({totalItems})
                  </button>
                )}
                <SortDropdown
                  value={sortOption}
                  onChange={(value: SortOption) => {
                    if (onSortChange) onSortChange(value);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectsHeader;
