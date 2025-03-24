import { useCallback } from 'react'
import { useSetState } from 'react-use'
import type { Project } from '~/lib/types/projects.types'

export type SortOption = 'popular' | 'newest' | 'funding' | 'supporters'

export function useProjectsFilter() {
	const [state, setState] = useSetState<{
		selectedCategories: string[]
		sortOption: SortOption
	}>({
		selectedCategories: [],
		sortOption: 'popular',
	})
	const { selectedCategories, sortOption } = state

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
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					)
				case 'funding':
					return sortedProjects.sort(
						(a, b) =>
							b.current_amount / b.target_amount -
							a.current_amount / a.target_amount,
					)
				case 'supporters':
					return sortedProjects.sort(
						(a, b) => b.investors_count - a.investors_count,
					)
				default:
					return sortedProjects
			}
		},
		[],
	)

	return {
		selectedCategories,
		setSelectedCategories: (val: string[]) =>
			setState((prev) => ({ ...prev, selectedCategories: val })),
		sortOption,
		setSortOption: (val: SortOption) =>
			setState((prev) => ({ ...prev, sortOption: val })),
		filterProjects,
		sortProjects,
	}
}
