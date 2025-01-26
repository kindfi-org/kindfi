import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '~/lib/fallbacks/error-fallback'
import { LoadingFallback } from '~/lib/fallbacks/loading-fallback'
import { AchievementsGrid } from '../sections/dashboard/achievement-grid'

export default function AchievementPage() {
	return (
		<ErrorBoundary fallback={<ErrorFallback />}>
			<Suspense
				fallback={<LoadingFallback description="Loading achievements..." />}
			>
				<main aria-label="Achievements">
					<h1 className="sr-only">Achievements</h1>
					<AchievementsGrid />
				</main>
			</Suspense>
		</ErrorBoundary>
	)
}
