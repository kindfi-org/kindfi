'use client'

import { useCallback, useRef, useState } from 'react'
import { logger } from '@/lib/logger'

export type AnalysisStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

interface UsePitchAnalysisReturn {
	analysis: string
	status: AnalysisStatus
	errorMessage: string | null
	analyze: (title: string, story: string) => Promise<void>
	reset: () => void
	isLoading: boolean
}

export const usePitchAnalysis = (): UsePitchAnalysisReturn => {
	const [analysis, setAnalysis] = useState('')
	const [status, setStatus] = useState<AnalysisStatus>('idle')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)

	const reset = useCallback(() => {
		abortControllerRef.current?.abort()
		setAnalysis('')
		setStatus('idle')
		setErrorMessage(null)
	}, [])

	const analyze = useCallback(async (title: string, story: string) => {
		abortControllerRef.current?.abort()
		const controller = new AbortController()
		abortControllerRef.current = controller

		setAnalysis('')
		setErrorMessage(null)
		setStatus('loading')

		try {
			const response = await fetch('/api/projects/pitch/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, story }),
				signal: controller.signal,
			})

			if (!response.ok) {
				const error = await response.json().catch(() => ({}))
				throw new Error(
					typeof error.error === 'string' ? error.error : `Request failed: ${response.status}`,
				)
			}

			if (!response.body) throw new Error('No response body')

			setStatus('streaming')

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let accumulated = ''

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				accumulated += decoder.decode(value, { stream: true })
				setAnalysis(accumulated)
			}

			accumulated += decoder.decode()
			setAnalysis(accumulated)

			if (!accumulated.trim()) {
				setErrorMessage('The analysis returned no content. Please try again.')
				setStatus('error')
				return
			}

			setStatus('done')
		} catch (err) {
			if ((err as Error).name === 'AbortError') return
			logger.error('[usePitchAnalysis]', err)
			setErrorMessage(err instanceof Error ? err.message : 'The analysis could not be completed.')
			setStatus('error')
		}
	}, [])

	return {
		analysis,
		status,
		errorMessage,
		analyze,
		reset,
		isLoading: status === 'loading' || status === 'streaming',
	}
}
