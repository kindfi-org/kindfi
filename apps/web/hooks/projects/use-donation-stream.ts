'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DonationStreamItem } from '~/lib/queries/projects/get-project-donation-stream'

interface UseDonationStreamParams {
	projectSlug?: string
	limit?: number
	pollIntervalMs?: number
}

/**
 * A key that combines the request parameters to track which request a response
 * belongs to. Used to ignore responses from obsolete requests when the slug or
 * limit changes.
 */
function getRequestKey(slug: string, limit: number): string {
	return `${slug}:${limit}`
}

export function useDonationStream({
	projectSlug,
	limit = 15,
	pollIntervalMs = 15_000,
}: UseDonationStreamParams) {
	const [donations, setDonations] = useState<DonationStreamItem[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<unknown>(null)

	// Track the current request scope (slug + limit). Used to ignore stale
	// responses from obsolete requests.
	const requestKeyRef = useRef<string | undefined>(undefined)
	// Track the most recent donation timestamp for incremental polling within
	// the current scope.
	const latestDonatedAtRef = useRef<string | undefined>(undefined)
	// Store the AbortController for the currently in-flight request so we can
	// cancel it when unmounting or changing projects.
	const abortControllerRef = useRef<AbortController | undefined>(undefined)

	const fetchDonations = useCallback(
		async (showLoading = true, after?: string) => {
			if (!projectSlug) return

			// Abort any previous in-flight request for a different scope.
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}

			const abortController = new AbortController()
			abortControllerRef.current = abortController

			const currentRequestKey = getRequestKey(projectSlug, limit)

			try {
				if (showLoading) setIsLoading(true)
				setError(null)

				const url = new URL(
					`/api/projects/${encodeURIComponent(projectSlug)}/donations/stream`,
					window.location.origin,
				)
				url.searchParams.set('limit', String(limit))
				if (after) url.searchParams.set('after', after)

				const response = await fetch(url.toString(), { signal: abortController.signal })

				// Ignore responses for obsolete requests (scope mismatch).
				if (currentRequestKey !== getRequestKey(projectSlug, limit)) {
					return
				}

				if (!response.ok) {
					throw new Error('Failed to load donation stream')
				}

				const json = (await response.json()) as { data?: DonationStreamItem[] }
				const incoming = json.data ?? []

				// Update the request key only after a successful response to track
				// which scope we're on.
				requestKeyRef.current = currentRequestKey

				if (incoming.length > 0) {
					if (after) {
						// Incremental poll: prepend new items, keep existing ones
						setDonations((prev) => [...incoming, ...prev])
					} else {
						// Initial or manual full load
						setDonations(incoming)
					}
					latestDonatedAtRef.current = incoming[0].donatedAt
				} else if (!after) {
					// Empty full-load response: clear stale data from a previous scope.
					// Do not clear on incremental polls (after is defined) since an empty
					// incremental response is benign (no new donations yet).
					setDonations([])
					latestDonatedAtRef.current = undefined
				}
			} catch (fetchError) {
				// Ignore abort errors (they occur when switching projects/unmounting).
				if (fetchError instanceof Error && fetchError.name === 'AbortError') {
					return
				}
				setError(fetchError)
			} finally {
				if (showLoading) setIsLoading(false)
				// Clear the abort controller reference only if it's the one we created
				// for this fetch (not a newer one set by a concurrent request).
				if (abortControllerRef.current === abortController) {
					abortControllerRef.current = undefined
				}
			}
		},
		[projectSlug, limit],
	)

	useEffect(() => {
		if (!projectSlug) {
			// Reset state when projectSlug becomes undefined.
			setDonations([])
			latestDonatedAtRef.current = undefined
			return
		}

		// Check if the slug has changed. If so, reset data and cursor for the new scope.
		const newRequestKey = getRequestKey(projectSlug, limit)
		if (requestKeyRef.current && requestKeyRef.current !== newRequestKey) {
			setDonations([])
			latestDonatedAtRef.current = undefined
		}
		requestKeyRef.current = newRequestKey

		// Trigger an initial full load for this scope.
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
			// Abort any in-flight request for this effect cleanup (unmount or slug change).
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
				abortControllerRef.current = undefined
			}
		}
	}, [projectSlug, fetchDonations, pollIntervalMs, limit])

	const refetch = useCallback(() => {
		latestDonatedAtRef.current = undefined
		return fetchDonations(true)
	}, [fetchDonations])

	return useMemo(
		() => ({ donations, isLoading, error, refetch }),
		[donations, isLoading, error, refetch],
	)
}
