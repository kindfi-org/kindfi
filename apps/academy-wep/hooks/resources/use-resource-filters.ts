import { useEffect, useState } from 'react'

import type {
	ExperienceLevel,
	Resource,
	ResourceCategory,
	ResourceType,
	SortOption,
} from '~/lib/types/resources.types'

export function useResourceFilters(resources: Resource[]) {
	const [selectedCategories, setSelectedCategories] = useState<
		ResourceCategory[]
	>([])
	const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([])
	const [selectedLevels, setSelectedLevels] = useState<ExperienceLevel[]>([])
	const [sortOption, setSortOption] = useState<SortOption>('Most Recent')
	const [filteredResources, setFilteredResources] =
		useState<Resource[]>(resources)
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
			case 'Most Recent':
				result.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				)
				break
			case 'Oldest':
				result.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				)
				break
			case 'Most Viewed':
				result.sort((a, b) => b.likes - a.likes)
				break
			default:
				// Default to Most Recent if an unexpected value is provided
				result.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				)
				break
		}

		setFilteredResources(result)
	}, [resources, selectedCategories, selectedTypes, selectedLevels, sortOption])

	const resetFilters = () => {
		setSelectedCategories([])
		setSelectedTypes([])
		setSelectedLevels([])
	}

	const toggleCategory = (c: ResourceCategory) =>
		setSelectedCategories((prev) =>
			prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
		)

	const toggleType = (t: ResourceType) =>
		setSelectedTypes((prev) =>
			prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
		)

	const toggleLevel = (l: ExperienceLevel) =>
		setSelectedLevels((prev) =>
			prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
		)

	const loadMore = () =>
		setVisibleCount((prev) => Math.min(prev + 3, filteredResources.length))

	return {
		selectedCategories,
		selectedTypes,
		selectedLevels,
		sortOption,
		filteredResources,
		visibleCount,
		setSortOption,
		resetFilters,
		toggleCategory,
		toggleType,
		toggleLevel,
		loadMore,
	}
}
