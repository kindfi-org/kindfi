import { useEffect, useState } from 'react'
import { UserMetricCard } from '~/components/dashboard/cards/user-metric-card'
import { metricsConfig } from '~/lib/constants/dashboard'
import { cn } from '~/lib/utils'

interface UserMetricsGridProps {
	className?: string
}

export function UserMetricsGrid({ className }: UserMetricsGridProps) {
	const [stats, setStats] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	const fetchUserStats = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch('/api/users/stats')
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch stats')
			}

			if (result.success) {
				setStats(result.data)
			} else {
				throw new Error('Invalid response')
			}
		} catch (err) {
			console.log('Stats fetch error:', err)
			setError(err.message || 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchUserStats()

		const interval = setInterval(fetchUserStats, 30000)

		return () => clearInterval(interval)
	}, [])

	if (error) {
		return (
			<div className="flex items-center justify-center h-32 px-4 rounded-lg border border-red-200 bg-red-50">
				<div className="text-center">
					<p className="text-red-600">Failed to load stats</p>
					<p className="text-red-500 text-sm">{error}</p>
					<button
						onClick={fetchUserStats}
						className="text-sm text-red-700 underline"
					>
						Try again
					</button>
				</div>
			</div>
		)
	}

	if (isLoading || !stats) {
		return (
			<div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4">
				{metricsConfig.map((metric) => (
					<div
						key={metric.key}
						className="h-32 rounded-lg border animate-pulse bg-gray-100"
					>
						<div className="p-4 space-y-3">
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							<div className="h-8 bg-gray-200 rounded w-1/2"></div>
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4">
			{metricsConfig.map((metric) => (
				<UserMetricCard
					key={metric.key}
					title={metric.title}
					value={stats[metric.key]}
					trendValue={stats.trends[metric.key].value}
					isPositive={stats.trends[metric.key].isPositive}
					icon={metric.icon}
					iconColor={metric.iconColor}
					text={metric.text}
					description={metric.description}
				/>
			))}
		</div>
	)
}
