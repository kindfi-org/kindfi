'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DonationStreamItem } from '~/lib/queries/projects/get-project-donation-stream'

interface UseDonationStreamParams {
	projectSlug?: string
	limit?: number
	pollIntervalMs?: number
}

export function useDonationStream({
	projectSlug,
	limit = 15,
	pollIntervalMs = 15_000,
}: UseDonationStreamParams) {
	const [donations, setDonations] = useState<DonationStreamItem[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<unknown>(null)

	const fetchDonations = useCallback(
		async (showLoading = true) => {
			if (!projectSlug) return

			try {
				if (showLoading) setIsLoading(true)
				setError(null)

				const response = await fetch(
					`/api/projects/${encodeURIComponent(projectSlug)}/donations/stream?limit=${limit}`,
				)

				if (!response.ok) {
					throw new Error('Failed to load donation stream')
				}

				const json = (await response.json()) as { data?: DonationStreamItem[] }
				setDonations(json.data ?? [])
			} catch (fetchError) {
				setError(fetchError)
			} finally {
				if (showLoading) setIsLoading(false)
			}
		},
		[projectSlug, limit],
	)

	useEffect(() => {
		if (!projectSlug) return

		fetchDonations(true)

		const intervalId = setInterval(() => {
			fetchDonations(false)
		}, pollIntervalMs)

		return () => {
			clearInterval(intervalId)
		}
	}, [projectSlug, fetchDonations, pollIntervalMs])

	const refetch = useCallback(() => {
		return fetchDonations(true)
	}, [fetchDonations])

	return useMemo(
		() => ({ donations, isLoading, error, refetch }),
		[donations, isLoading, error, refetch],
	)
}
