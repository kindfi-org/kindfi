'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

interface UseProjectSupportersCountParams {
	projectId?: string
}

const PROJECT_SUPPORTERS_COUNT_POLL_MS = 10_000

export function projectSupportersCountQueryOptions(projectId?: string) {
	return {
		queryKey: ['project-supporters-count', projectId] as const,
		queryFn: async ({ signal }: { signal: AbortSignal }) => {
			if (!projectId) return null

			const supabase = createSupabaseBrowserClient()
			const { data, error } = await supabase
				.from('contributions')
				.select('contributor_id')
				.eq('project_id', projectId)
				.gt('amount', 0)
				.abortSignal(signal)

			if (error) throw error

			const uniqueContributors = new Set(
				(data ?? []).map((row) => row.contributor_id).filter(Boolean),
			)
			return uniqueContributors.size
		},
		enabled: Boolean(projectId),
		staleTime: PROJECT_SUPPORTERS_COUNT_POLL_MS,
		refetchInterval: PROJECT_SUPPORTERS_COUNT_POLL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: 'always' as const,
	}
}

export function useProjectSupportersCount({ projectId }: UseProjectSupportersCountParams) {
	const {
		data: supportersCount = null,
		isPending,
		error,
		refetch,
	} = useQuery(projectSupportersCountQueryOptions(projectId))

	const refetchSupportersCount = useCallback(async () => {
		if (!projectId) return
		await refetch()
	}, [projectId, refetch])

	return useMemo(
		() => ({
			supportersCount,
			isLoading: Boolean(projectId) && isPending,
			error,
			refetch: refetchSupportersCount,
		}),
		[error, isPending, projectId, refetchSupportersCount, supportersCount],
	)
}
