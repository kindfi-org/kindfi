'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

	const isFetchingRef = useRef(false)
	const latestDonatedAtRef = useRef<string | undefined>(undefined)

	const fetchDonations = useCallback(
		async (showLoading = true, after?: string) => {
			if (!projectSlug || isFetchingRef.current) return

			isFetchingRef.current = true
			try {
				if (showLoading) setIsLoading(true)
				setError(null)

				const url = new URL(
					`/api/projects/${encodeURIComponent(projectSlug)}/donations/stream`,
					window.location.origin,
				)
				url.searchParams.set('limit', String(limit))
				if (after) url.searchParams.set('after', after)

				const response = await fetch(url.toString())

				if (!response.ok) {
					throw new Error('Failed to load donation stream')
				}

				const json = (await response.json()) as { data?: DonationStreamItem[] }
				const incoming = json.data ?? []

				if (incoming.length > 0) {
					if (after) {
						// Incremental poll: prepend new items, keep existing ones
						setDonations((prev) => [...incoming, ...prev])
					} else {
						// Initial or manual full load
						setDonations(incoming)
					}
					latestDonatedAtRef.current = incoming[0].donatedAt
				}
			} catch (fetchError) {
				setError(fetchError)
			} finally {
				isFetchingRef.current = false
				if (showLoading) setIsLoading(false)
			}
		},
		[projectSlug, limit],
	)

	useEffect(() => {
		if (!projectSlug) return

		fetchDonations(true)

		const intervalId = setInterval(() => {
			if (document.hidden) return
			fetchDonations(false, latestDonatedAtRef.current)
		}, pollIntervalMs)

		function handleVisibilityChange() {
			if (!document.hidden) {
				fetchDonations(false, latestDonatedAtRef.current)
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			clearInterval(intervalId)
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [projectSlug, fetchDonations, pollIntervalMs])

	const refetch = useCallback(() => {
		latestDonatedAtRef.current = undefined
		return fetchDonations(true)
	}, [fetchDonations])

	return useMemo(
		() => ({ donations, isLoading, error, refetch }),
		[donations, isLoading, error, refetch],
	)
}
