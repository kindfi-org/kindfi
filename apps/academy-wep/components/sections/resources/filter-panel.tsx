"use client"

import { Button } from "~/components/base/button"
import { Badge } from "~/components/base/badge"
import { useResourceCounts } from "~/hooks/resources/use-resource-counts"
import type { ResourceCategory, ResourceType, ExperienceLevel, Resource } from "~/lib/types/resources.types"
import { cn } from "~/lib/utils"
import { getTypeIcon } from "~/lib/utils/resources/get-type-icon"

interface FilterPanelProps {
  resources: Resource[]
  selectedCategories: ResourceCategory[]
  selectedTypes: ResourceType[]
  selectedLevels: ExperienceLevel[]
  onCategoryChange: (category: ResourceCategory) => void
  onTypeChange: (type: ResourceType) => void
  onLevelChange: (level: ExperienceLevel) => void
  onResetFilters: () => void
}

export function FilterPanel({
  resources,
  selectedCategories,
  selectedTypes,
  selectedLevels,
  onCategoryChange,
  onTypeChange,
  onLevelChange,
  onResetFilters,
}: FilterPanelProps) {
  const { categoryCounts, typeCounts, levelCounts } = useResourceCounts(resources)

  const categories: ResourceCategory[] = ["Blockchain", "Stellar", "Web3", "KindFi", "Impact"]
  const types: ResourceType[] = ["article", "video", "guide", "document"]
  const levels: ExperienceLevel[] = ["Beginner", "Intermediate", "Advanced"]

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex gap-2 items-center flex-wrap">
        <h3 className="text-sm font-medium text-gray-700">Categories:</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategories.includes(category) ? "default" : "outline"}
              className={cn(
                "cursor-pointer rounded-full text-xs px-3 py-1",
                selectedCategories.includes(category)
                  ? "bg-green-100 text-primary border-primary hover:bg-green-200"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => onCategoryChange(category)}
            >
              {category} ({categoryCounts[category]})
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Resource Types */}
        <div className="flex gap-2 items-center flex-wrap lg:flex-1">
          <h3 className="text-sm font-medium text-gray-700 whitespace-nowrap">Types:</h3>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer rounded-full text-xs px-3 py-1",
                  selectedTypes.includes(type)
                    ? "bg-green-100 text-primary hover:bg-green-200"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => onTypeChange(type)}
              >
                <div className="flex items-center gap-1">
                  {getTypeIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}s ({typeCounts[type]})
                </div>
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="flex gap-2 items-center flex-wrap lg:flex-1">
          <h3 className="text-sm font-medium text-gray-700 whitespace-nowrap">Level:</h3>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Badge
                key={level}
                variant={selectedLevels.includes(level) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer rounded-full text-xs px-3 py-1",
                  selectedLevels.includes(level)
                    ? "bg-green-100 text-primary hover:bg-green-200"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => onLevelChange(level)}
              >
                {level} ({levelCounts[level]})
              </Badge>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-2 lg:pt-0 lg:flex lg:items-start lg:justify-end lg:w-40">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-800 bg-white hover:text-primary hover:bg-white border-gray-200 hover:border-primary rounded-full"
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
