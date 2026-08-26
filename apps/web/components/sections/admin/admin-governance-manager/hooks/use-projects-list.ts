import { useQuery } from '@tanstack/react-query'
import type { ProjectsListResponse } from '../types'

export const useProjectsList = (enabled: boolean) => {
	const query = useQuery<ProjectsListResponse>({
		queryKey: ['projects-list'],
		queryFn: async () => {
			const res = await fetch('/api/projects')
			if (!res.ok) throw new Error('Failed to fetch projects')
			return res.json()
		},
		enabled,
		staleTime: 5 * 60 * 1000,
	})

	return {
		...query,
		projects: query.data?.data ?? [],
	}
}
