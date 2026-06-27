'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface UseProjectSupportersCountParams {
	projectId?: string
}

export function useProjectSupportersCount({ projectId }: UseProjectSupportersCountParams) {
	const [supportersCount, setSupportersCount] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<unknown>(null)

	const fetchSupportersCount = useCallback(
		async (showLoading = true) => {
			if (!projectId) return
			try {
				if (showLoading) setIsLoading(true)
				setError(null)
				const supabase = createSupabaseBrowserClient()
				const { data, error: fetchError } = await supabase
					.from('contributions')
					.select('contributor_id')
					.eq('project_id', projectId)
					.gt('amount', 0)

				if (fetchError) throw fetchError

				const uniqueContributors = new Set(
					(data ?? []).map((row) => row.contributor_id).filter(Boolean),
				)
				setSupportersCount(uniqueContributors.size)
			} catch (e) {
				setError(e)
			} finally {
				if (showLoading) setIsLoading(false)
			}
		},
		[projectId],
	)

	useEffect(() => {
		if (!projectId) return

		fetchSupportersCount(true)

		const intervalId = setInterval(() => {
			fetchSupportersCount(false)
		}, 10000)

		return () => {
			clearInterval(intervalId)
		}
	}, [projectId, fetchSupportersCount])

	const refetch = useCallback(() => {
		return fetchSupportersCount(true)
	}, [fetchSupportersCount])

	return useMemo(
		() => ({ supportersCount, isLoading, error, refetch }),
		[supportersCount, isLoading, error, refetch],
	)
}
