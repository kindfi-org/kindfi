"use client"

import { Filter, ChevronDown } from "lucide-react"

import { Button } from "~/components/base/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/base/dropdown-menu"

interface AllResourcesProps {
  totalResources: number
  sortOption: string
  onSortChange: (option: string) => void
  onToggleFilters: () => void
}

export function AllResources({
  totalResources,
  sortOption,
  onSortChange,
  onToggleFilters,
}: AllResourcesProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">All Resources</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <div className="text-gray-600 text-sm font-medium">Showing {totalResources} resources</div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-gray-800 bg-white hover:text-primary hover:bg-white border-gray-200 hover:border-primary"
            onClick={onToggleFilters}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                {sortOption}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange("Most Recent")}>Most Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("Oldest")}>Oldest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("Most Viewed")}>Most Viewed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

