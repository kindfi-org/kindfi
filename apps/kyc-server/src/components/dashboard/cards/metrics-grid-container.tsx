import { useCallback, useEffect, useRef, useState } from 'react'
import { MetricsGrid } from '~/components/dashboard/cards/metrics-grid'
import { MetricCardSkeleton } from '~/components/dashboard/skeletons/metric-card-skeleton'
import { metricsConfig } from '~/lib/constants/dashboard'
import type { KycStats } from '~/lib/types/dashboard'
import { cn } from '~/lib/utils'

interface MetricsGridContainerProps {
	className?: string
}

export function MetricsGridContainer({ className }: MetricsGridContainerProps) {
	const [stats, setStats] = useState<KycStats | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const abortControllerRef = useRef<AbortController | null>(null)
	const isMountedRef = useRef(true)

	const fetchUserStats = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		const controller = new AbortController()
		abortControllerRef.current = controller

		if (!isMountedRef.current) return

		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch('/api/users/stats', {
				signal: controller.signal,
			})

			if (controller.signal.aborted || !isMountedRef.current) return

			const result = await response.json()

			if (controller.signal.aborted || !isMountedRef.current) return

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch stats')
			}

			if (result.success) {
				setStats(result.data)
			} else {
				throw new Error('Invalid response')
			}
		} catch (err: unknown) {
			if (controller.signal.aborted || !isMountedRef.current) return

			if (err instanceof Error && err.name === 'AbortError') return

			console.error('Stats fetch error:', err)
			const errorMessage =
				err instanceof Error ? err.message : 'Something went wrong'
			setError(errorMessage)
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false)
			}
		}
	}, [])

	useEffect(() => {
		isMountedRef.current = true

		fetchUserStats()

		let intervalId: NodeJS.Timeout | null = null

		const startInterval = () => {
			if (!document.hidden && !intervalId && isMountedRef.current) {
				intervalId = setInterval(fetchUserStats, 30000)
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
				fetchUserStats()
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
	}, [fetchUserStats])

	if (error) {
		return (
			<div
				className="flex items-center justify-center h-32 px-4 rounded-lg border border-red-200 bg-red-50"
				role="alert"
			>
				<div className="text-center">
					<p className="text-red-600">Failed to load stats</p>
					<p className="text-red-500 text-sm">{error}</p>
					<button
						onClick={fetchUserStats}
						className="mt-2 px-3 py-1 text-xs text-red-600 hover:text-red-700 underline"
						type="button"
					>
						Try again
					</button>
				</div>
			</div>
		)
	}

	if (isLoading || !stats) {
		return (
			<div
				className={cn(
					'*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6',
					className,
				)}
			>
				{metricsConfig.map((metric) => (
					<MetricCardSkeleton key={metric.key} />
				))}
			</div>
		)
	}

	return <MetricsGrid stats={stats} className={className} />
}
