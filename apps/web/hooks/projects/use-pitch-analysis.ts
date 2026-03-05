'use client'

import { useCallback, useRef, useState } from 'react'

export type AnalysisStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

interface UsePitchAnalysisReturn {
	analysis: string
	status: AnalysisStatus
	analyze: (title: string, story: string) => Promise<void>
	reset: () => void
	isLoading: boolean
}

export const usePitchAnalysis = (): UsePitchAnalysisReturn => {
	const [analysis, setAnalysis] = useState('')
	const [status, setStatus] = useState<AnalysisStatus>('idle')
	const abortControllerRef = useRef<AbortController | null>(null)

	const reset = useCallback(() => {
		abortControllerRef.current?.abort()
		setAnalysis('')
		setStatus('idle')
	}, [])

	const analyze = useCallback(async (title: string, story: string) => {
		abortControllerRef.current?.abort()
		const controller = new AbortController()
		abortControllerRef.current = controller

		setAnalysis('')
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
				throw new Error(error.error ?? `Request failed: ${response.status}`)
			}

			if (!response.body) throw new Error('No response body')

			setStatus('streaming')

			const reader = response.body.getReader()
			const decoder = new TextDecoder()

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				setAnalysis((prev) => prev + decoder.decode(value, { stream: true }))
			}

			setStatus('done')
		} catch (err) {
			if ((err as Error).name === 'AbortError') return
			console.error('[usePitchAnalysis]', err)
			setStatus('error')
		}
	}, [])

	return {
		analysis,
		status,
		analyze,
		reset,
		isLoading: status === 'loading' || status === 'streaming',
	}
}
