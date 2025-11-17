'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface UseProjectSupportersCountParams {
	projectId?: string
}

export function useProjectSupportersCount({
	projectId,
}: UseProjectSupportersCountParams) {
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
					.from('projects')
					.select('kinder_count')
					.eq('id', projectId)
					.single()

				if (fetchError) throw fetchError
				if (data) setSupportersCount(data.kinder_count)
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

		// Initial fetch with loading state
		fetchSupportersCount(true)

		// Set up polling to refresh count every 10 seconds (without loading state)
		const intervalId = setInterval(() => {
			fetchSupportersCount(false)
		}, 10000) // Poll every 10 seconds

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

