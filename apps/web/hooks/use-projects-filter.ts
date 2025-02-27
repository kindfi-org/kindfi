import { useCallback, useState } from 'react'
import type { Project } from '~/lib/types/projects.types'

export type SortOption = 'popular' | 'newest' | 'funding' | 'supporters'

export function useProjectsFilter() {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [sortOption, setSortOption] = useState<SortOption>('popular')

	const filterProjects = useCallback(
		(projects: Project[]) => {
			if (selectedCategories.length === 0) return projects

			return projects.filter((project) =>
				project.categories.some((category) =>
					selectedCategories.includes(category),
				),
			)
		},
		[selectedCategories],
	)

	const sortProjects = useCallback(
		(projects: Project[], option: SortOption) => {
			const sortedProjects = [...projects]

			switch (option) {
				case 'newest':
					return sortedProjects.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)
				case 'funding':
					return sortedProjects.sort(
						(a, b) =>
							b.currentAmount / b.goalAmount - a.currentAmount / a.goalAmount,
					)
				case 'supporters':
					return sortedProjects.sort((a, b) => b.supporters - a.supporters)
				default:
					return sortedProjects
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
