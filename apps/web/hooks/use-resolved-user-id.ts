'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveAuthenticatedUserId } from '~/lib/kyc/resolved-user-id'

export interface UseResolvedUserIdResult {
	userId: string | null
	isLoading: boolean
	error: string | null
	refresh: () => void
}

/**
 * Resolves the authenticated user id into component state.
 *
 * - A non-empty `userIdProp` is used directly; otherwise `/api/auth/user` is
 *   queried once on mount (and again when the prop changes).
 * - A lookup that is pending or failed yields `null`, never `''`, so callers can
 *   distinguish "principal not resolved" from "resolved principal".
 * - Late results after unmount are ignored, and when a `refresh()` overlaps an
 *   in-flight resolution only the most recent request is allowed to write state.
 */
export function useResolvedUserId(userIdProp?: string): UseResolvedUserIdResult {
	const [userId, setUserId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [reloadKey, setReloadKey] = useState(0)

	const latestRequestRef = useRef(0)

	useEffect(() => {
		const requestId = latestRequestRef.current + 1
		latestRequestRef.current = requestId
		let cancelled = false

		setIsLoading(true)
		setError(null)

		void resolveAuthenticatedUserId({
			userId: userIdProp,
			fetchUser: (input) => fetch(input),
		}).then((result) => {
			// Ignore resolutions from an unmounted component or a superseded request.
			if (cancelled || latestRequestRef.current !== requestId) return

			if (result.status === 'unavailable') {
				setUserId(null)
				setError(result.reason)
			} else {
				setUserId(result.userId)
				setError(null)
			}
			setIsLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [userIdProp, reloadKey])

	const refresh = useCallback(() => {
		setReloadKey((key) => key + 1)
	}, [])

	return { userId, isLoading, error, refresh }
}
