// lib/hooks/useResourceFilters.ts
import { useState, useEffect } from "react"
import type { ExperienceLevel, Resource, ResourceCategory, ResourceType } from "~/lib/types/resources.types"

export function useResourceFilters(resources: Resource[]) {
  const [selectedCategories, setSelectedCategories] = useState<ResourceCategory[]>([])
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([])
  const [selectedLevels, setSelectedLevels] = useState<ExperienceLevel[]>([])
  const [sortOption, setSortOption] = useState("Most Recent")
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resources)
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    let result = [...resources]

    if (selectedCategories.length > 0) {
      result = result.filter((r) => selectedCategories.includes(r.category))
    }
    if (selectedTypes.length > 0) {
      result = result.filter((r) => selectedTypes.includes(r.type))
    }
    if (selectedLevels.length > 0) {
      result = result.filter((r) => selectedLevels.includes(r.level))
    }

    switch (sortOption) {
      case "Most Recent":
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "Oldest":
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "Most Viewed":
        result.sort((a, b) => b.likes - a.likes)
        break
    }

    setFilteredResources(result)
  }, [resources, selectedCategories, selectedTypes, selectedLevels, sortOption])

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedTypes([])
    setSelectedLevels([])
  }

  return {
    selectedCategories,
    selectedTypes,
    selectedLevels,
    sortOption,
    filteredResources,
    visibleCount,
    setSortOption,
    resetFilters,
    toggleCategory: (c: ResourceCategory) =>
      setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]),
    toggleType: (t: ResourceType) =>
      setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]),
    toggleLevel: (l: ExperienceLevel) =>
      setSelectedLevels((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]),
    loadMore: () => setVisibleCount((prev) => Math.min(prev + 3, filteredResources.length)),
  }
}
