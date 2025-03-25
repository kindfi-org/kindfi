import { useCallback, useState } from 'react'
import type { Project } from '~/components/shared/project-card'

export type SortOption = 'popular' | 'newest' | 'funding' | 'supporters'

export function useProjectsFilter() {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [sortOption, setSortOption] = useState<SortOption>('popular')

	const filterProjects = useCallback(
		(projects: Project[]) => {
			if (selectedCategories.length === 0) return projects

			return projects.filter((project) => {
				// Handle different ways categories might be stored
				// 1. In the 'category' field as a string
				if (project.category && selectedCategories.includes(project.category)) {
					return true
				}

				// 2. In the 'tags' array
				if (project.tags && project.tags.length > 0) {
					return project.tags.some((tag) => {
						const tagText = typeof tag === 'string' ? tag : tag.text
						return selectedCategories.includes(tagText)
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
				case 'newest':
					// Fallback to current date if createdAt is not available
					return sortedProjects.sort((a, b) => {
						const dateA = a.createdAt
							? new Date(a.createdAt).getTime()
							: Date.now()
						const dateB = b.createdAt
							? new Date(b.createdAt).getTime()
							: Date.now()
						return dateB - dateA
					})
				case 'funding':
					return sortedProjects.sort((a, b) => {
						const percentA =
							a.percentageComplete ||
							(a.currentAmount / (a.targetAmount || a.goal || 1)) * 100
						const percentB =
							b.percentageComplete ||
							(b.currentAmount / (b.targetAmount || b.goal || 1)) * 100
						return percentB - percentA
					})
				case 'supporters':
					return sortedProjects.sort(
						(a, b) =>
							(b.investors || b.donors || 0) - (a.investors || a.donors || 0),
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
							(b.investors || b.donors || 0) - (a.investors || a.donors || 0)
						)
					})
			}
		},
		[],
	)

	return {
		selectedCategories,
		setSelectedCategories,
		sortOption,
		setSortOption,
		filterProjects,
		sortProjects,
	}
}
