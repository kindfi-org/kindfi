import { useCallback } from 'react'
import { useSetState } from 'react-use'
import type { SortOption } from '~/lib/types/project'
import type { Project } from '~/lib/types/projects.types'

export function useProjectsFilter() {
	const [state, setState] = useSetState<{
		selectedCategories: string[]
		sortOption: SortOption
	}>({
		selectedCategories: [],
		sortOption: 'Most Popular',
	})
	const { selectedCategories, sortOption } = state

	const filterProjects = useCallback(
		(projects: Project[]) => {
			if (selectedCategories.length === 0) return projects

			// Debug selected categories
			console.log('Filtering with categories:', selectedCategories)

			return projects.filter((project) => {
				// Handle different ways categories might be stored
				// 1. In the 'categories' field as a array of string
				if (project.categories && project.categories.length > 0) {
					const match = project.categories.some((category) => {
						if (!category) return false
						// Make comparison consistent by lowercasing both sides
						return selectedCategories.some(
							(selected) => selected.toLowerCase() === category.toLowerCase(),
						)
					})
					if (match) return true
				}

				// 2. In the 'tags' array
				if (project.tags && project.tags.length > 0) {
					return project.tags.some((tag) => {
						const tagText = typeof tag === 'string' ? tag : tag.text
						if (!tagText) return false
						return selectedCategories.some(
							(selected) => selected.toLowerCase() === tagText.toLowerCase(),
						)
					})
				}

				return false
			})
		},
		[selectedCategories],
	)

	const sortProjects = useCallback(
		(projects: Project[], option: SortOption) => {
			const sortedProjects = [...projects]

			switch (option) {
				case 'Most Recent':
					// Fallback to current date if createdAt is not available
					return sortedProjects.sort((a, b) => {
						const dateA = a.created_at
							? new Date(a.created_at).getTime()
							: Date.now()
						const dateB = b.created_at
							? new Date(b.created_at).getTime()
							: Date.now()
						return dateB - dateA
					})
				case 'Most Funded':
					return sortedProjects.sort((a, b) => {
						const percentA =
							a.percentage_complete ||
							(a.current_amount / (a.target_amount || a.goal || 1)) * 100
						const percentB =
							b.percentage_complete ||
							(b.current_amount / (b.target_amount || b.goal || 1)) * 100
						return percentB - percentA
					})
				case 'Most Supporters':
					return sortedProjects.sort(
						(a, b) =>
							(b.kinder_count || b.donors || 0) -
							(a.kinder_count || a.donors || 0),
					)
				default:
					// 'popular' - could be based on a trending flag or other metrics
					return sortedProjects.sort((a, b) => {
						// Sort by trending flag first
						if (a.trending && !b.trending) return -1
						if (!a.trending && b.trending) return 1

						// Then by featured flag
						if (a.featured && !b.featured) return -1
						if (!a.featured && b.featured) return 1

						// Then by number of supporters
						return (
							(b.kinder_count || b.donors || 0) -
							(a.kinder_count || a.donors || 0)
						)
					})
			}
		},
		[],
	)

	return {
		selectedCategories,
		setSelectedCategories: (val: string[]) => {
			console.log('Setting categories to:', val)
			setState((prev) => ({ ...prev, selectedCategories: val }))
		},
		sortOption,
		setSortOption: (val: SortOption) =>
			setState((prev) => ({ ...prev, sortOption: val })),
		filterProjects,
		sortProjects,
	}
}
