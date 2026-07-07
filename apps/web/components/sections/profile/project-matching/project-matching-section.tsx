'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, Loader2, RefreshCw, Sparkles, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '~/components/base/button'
import { useProjectMatching } from '~/hooks/profile/use-project-matching'
import { useI18n } from '~/lib/i18n'
import { ProfileSectionHeader } from '../profile-section-header'
import { ProfileSurfaceCard } from '../profile-surface-card'
import { RecommendedProjectCard } from './recommended-project-card'

export const ProjectMatchingSection = () => {
	const { t } = useI18n()
	const prefersReducedMotion = useReducedMotion()
	const [isExpanded, setIsExpanded] = useState(false)
	const { result, status, errorMessage, fetchMatches, reset, isLoading } = useProjectMatching()

	const handleActivate = useCallback(async () => {
		setIsExpanded(true)
		await fetchMatches()
	}, [fetchMatches])

	const handleDismiss = useCallback(() => {
		reset()
		setIsExpanded(false)
	}, [reset])

	const handleRetry = useCallback(async () => {
		await fetchMatches()
	}, [fetchMatches])

	const showResults = isExpanded && (status === 'loading' || status === 'done')
	const showError = isExpanded && status === 'error'

	return (
		<section className="space-y-5">
			<ProfileSectionHeader
				eyebrow={t('profile.matchingEyebrow')}
				title={t('profile.matchingTitle')}
				highlight={t('profile.matchingHighlight')}
				description={t('profile.matchingDescription')}
			/>

			<AnimatePresence mode="wait">
				{!isExpanded ? (
					<motion.div
						key="cta"
						initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
						transition={{ duration: 0.25 }}
					>
						<ProfileSurfaceCard className="border-dashed border-emerald-200/80 bg-emerald-50/40">
							<div className="flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:text-left">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
									<Sparkles className="h-5 w-5" aria-hidden="true" />
								</div>
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium text-foreground">
										{t('profile.matchingCtaTitle')}
									</p>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{t('profile.matchingCtaDescription')}
									</p>
								</div>
								<Button
									type="button"
									onClick={handleActivate}
									className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700"
								>
									<Sparkles className="mr-2 h-4 w-4" />
									{t('profile.matchingCtaButton')}
								</Button>
							</div>
						</ProfileSurfaceCard>
					</motion.div>
				) : (
					<motion.div
						key="results"
						initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={prefersReducedMotion ? undefined : { opacity: 0 }}
						transition={{ duration: 0.25 }}
						className="space-y-5"
					>
						<ProfileSurfaceCard>
							<div className="mb-4 flex items-start justify-between gap-3">
								<div className="flex items-center gap-2">
									<div className="rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 text-white">
										<Sparkles className="h-4 w-4" aria-hidden="true" />
									</div>
									<div>
										<h3 className="text-base font-semibold">{t('profile.matchingResultsTitle')}</h3>
										{isLoading ? (
											<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<Loader2 className="h-3 w-3 animate-spin" />
												{t('profile.matchingLoading')}
											</p>
										) : status === 'done' ? (
											<p className="text-xs text-emerald-600">{t('profile.matchingComplete')}</p>
										) : null}
									</div>
								</div>

								{!isLoading ? (
									<button
										type="button"
										onClick={handleDismiss}
										aria-label={t('profile.matchingDismiss')}
										className="text-muted-foreground transition-colors hover:text-foreground"
									>
										<X className="h-4 w-4" />
									</button>
								) : null}
							</div>

							{isLoading ? (
								<div className="space-y-3" aria-live="polite" aria-busy="true">
									{(
										[
											{ w: 90, id: 'sk-1' },
											{ w: 75, id: 'sk-2' },
											{ w: 85, id: 'sk-3' },
										] as const
									).map(({ w, id }) => (
										<div
											key={id}
											className="h-3 animate-pulse rounded-full bg-gradient-to-r from-muted to-muted/40"
											style={{ width: `${w}%` }}
										/>
									))}
									<p className="text-sm text-muted-foreground">
										{t('profile.matchingLoadingHint')}
									</p>
								</div>
							) : null}

							{showError ? (
								<div className="space-y-3">
									<div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3">
										<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
										<p className="text-sm text-destructive">
											{errorMessage ?? t('profile.matchingError')}
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleRetry}
										className="rounded-full"
									>
										<RefreshCw className="mr-2 h-3.5 w-3.5" />
										{t('profile.matchingRetry')}
									</Button>
								</div>
							) : null}

							{showResults && status === 'done' && result ? (
								<div className="space-y-5">
									<p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>

									{(result.preferenceInsights.topCategories.length > 0 ||
										result.preferenceInsights.topRegions.length > 0) && (
										<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
											{result.preferenceInsights.topCategories.length > 0 ? (
												<span className="rounded-full bg-muted px-3 py-1">
													{t('profile.matchingCategories')}:{' '}
													{result.preferenceInsights.topCategories.join(', ')}
												</span>
											) : null}
											{result.preferenceInsights.topRegions.length > 0 ? (
												<span className="rounded-full bg-muted px-3 py-1">
													{t('profile.matchingRegions')}:{' '}
													{result.preferenceInsights.topRegions.join(', ')}
												</span>
											) : null}
										</div>
									)}

									<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{result.recommendations.map((project) => (
											<RecommendedProjectCard key={project.projectId} project={project} />
										))}
									</div>
								</div>
							) : null}
						</ProfileSurfaceCard>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	)
}
