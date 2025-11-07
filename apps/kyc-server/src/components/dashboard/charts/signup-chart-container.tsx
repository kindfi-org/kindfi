'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SignupChart } from '~/components/dashboard/charts/signup-chart'
import type { ChartDataPoint } from '~/lib/types/dashboard'
import { cn } from '~/lib/utils'

interface SignupChartContainerProps {
	className?: string
}

type Period = '7d' | '30d' | '90d' | 'all'

export function SignupChartContainer({ className }: SignupChartContainerProps) {
	const [data, setData] = useState<ChartDataPoint[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [period, setPeriod] = useState<Period>('30d')

	const abortControllerRef = useRef<AbortController | null>(null)
	const isMountedRef = useRef(true)

	const fetchSignupData = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		const controller = new AbortController()
		abortControllerRef.current = controller

		if (!isMountedRef.current) return

		try {
			setIsLoading(true)
			setError(null)

			const url = `/api/users/chart?period=${period}`

			const response = await fetch(url, {
				signal: controller.signal,
			})

			if (controller.signal.aborted || !isMountedRef.current) return

			const result = await response.json()

			if (controller.signal.aborted || !isMountedRef.current) return

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch signup data')
			}

			if (result.success) {
				setData(result.data)
			} else {
				throw new Error('Invalid response')
			}
		} catch (err: unknown) {
			if (controller.signal.aborted || !isMountedRef.current) return

			if (err instanceof Error && err.name === 'AbortError') return

			console.error('Signup data fetch error:', err)
			const errorMessage =
				err instanceof Error ? err.message : 'Something went wrong'
			setError(errorMessage)
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false)
			}
		}
	}, [period])

	useEffect(() => {
		isMountedRef.current = true

		fetchSignupData()

		let intervalId: NodeJS.Timeout | null = null

		const startInterval = () => {
			if (!document.hidden && !intervalId && isMountedRef.current) {
				intervalId = setInterval(fetchSignupData, 60000)
			}
		}

		const stopInterval = () => {
			if (intervalId) {
				clearInterval(intervalId)
				intervalId = null
			}
		}

		const handleVisibilityChange = () => {
			if (document.hidden) {
				stopInterval()
			} else {
				startInterval()
				fetchSignupData()
			}
		}

		startInterval()

		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			isMountedRef.current = false
			stopInterval()
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [fetchSignupData])

	// TODO: Connect to a react state to update fetch
	const handlePeriodChange = useCallback((newPeriod: Period) => {
		setPeriod(newPeriod)
	}, [])

	if (error) {
		return (
			<div
				className={cn(
					'flex items-center justify-center h-64 rounded-lg border border-red-200 bg-red-50',
					className,
				)}
				role="alert"
			>
				<div className="text-center">
					<p className="text-red-600">Failed to load signup data</p>
					<p className="text-red-500 text-sm">{error}</p>
					<button
						onClick={fetchSignupData}
						className="mt-2 px-3 py-1 text-xs text-red-600 hover:text-red-700 underline"
						type="button"
					>
						Try again
					</button>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div
				className={cn(
					'flex items-center justify-center h-64 rounded-lg border bg-card animate-pulse',
					className,
				)}
			>
				<div className="text-center">
					<div className="h-4 w-32 bg-muted rounded mx-auto mb-2" />
					<div className="h-3 w-24 bg-muted rounded mx-auto" />
				</div>
			</div>
		)
	}

	return (
		<SignupChart
			data={data}
			// className={className}
			// period={period}
			// onPeriodChange={handlePeriodChange}
		/>
	)
}
