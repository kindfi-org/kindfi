'use client'

import { useCallback, useRef, useState } from 'react'
import { logger } from '@/lib/logger'
import type { ProjectMatchingResult } from '~/lib/services/project-matching/schemas'

export type MatchingStatus = 'idle' | 'loading' | 'done' | 'error'

interface UseProjectMatchingReturn {
	result: ProjectMatchingResult | null
	status: MatchingStatus
	errorMessage: string | null
	fetchMatches: () => Promise<void>
	reset: () => void
	isLoading: boolean
}

export const useProjectMatching = (): UseProjectMatchingReturn => {
	const [result, setResult] = useState<ProjectMatchingResult | null>(null)
	const [status, setStatus] = useState<MatchingStatus>('idle')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)

	const reset = useCallback(() => {
		abortControllerRef.current?.abort()
		setResult(null)
		setStatus('idle')
		setErrorMessage(null)
	}, [])

	const fetchMatches = useCallback(async () => {
		abortControllerRef.current?.abort()
		const controller = new AbortController()
		abortControllerRef.current = controller

		setResult(null)
		setErrorMessage(null)
		setStatus('loading')

		try {
			const response = await fetch('/api/profile/project-matching', {
				method: 'POST',
				signal: controller.signal,
			})

			const payload = await response.json().catch(() => ({}))

			if (!response.ok) {
				throw new Error(
					typeof payload.error === 'string' ? payload.error : `Request failed: ${response.status}`,
				)
			}

			setResult(payload as ProjectMatchingResult)
			setStatus('done')
		} catch (err) {
			if ((err as Error).name === 'AbortError') return
			logger.error('[useProjectMatching]', err)
			setErrorMessage(
				err instanceof Error ? err.message : 'Could not load project recommendations.',
			)
			setStatus('error')
		}
	}, [])

	return {
		result,
		status,
		errorMessage,
		fetchMatches,
		reset,
		isLoading: status === 'loading',
	}
}
