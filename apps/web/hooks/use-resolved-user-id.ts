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
	const latestRequestRef = useRef(0)

	const resolveUserId = useCallback(() => {
		const requestId = latestRequestRef.current + 1
		latestRequestRef.current = requestId

		setIsLoading(true)
		setError(null)

		void resolveAuthenticatedUserId({
			userId: userIdProp,
			fetchUser: (input) => fetch(input),
		}).then((result) => {
			// Ignore resolutions from a superseded request.
			if (latestRequestRef.current !== requestId) return

			if (result.status === 'unavailable') {
				setUserId(null)
				setError(result.reason)
			} else {
				setUserId(result.userId)
				setError(null)
			}
			setIsLoading(false)
		})
	}, [userIdProp])

	useEffect(() => {
		resolveUserId()
	}, [resolveUserId])

	const refresh = useCallback(() => {
		resolveUserId()
	}, [resolveUserId])

	return { userId, isLoading, error, refresh }
}
