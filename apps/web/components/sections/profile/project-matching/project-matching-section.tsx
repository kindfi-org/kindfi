'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, Loader2, RefreshCw, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Button } from '~/components/base/button'
import { useProjectMatching } from '~/hooks/profile/use-project-matching'
import { getFadeInAnimateProps } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import { ProfileSectionHeader } from '../profile-section-header'
import { ProfileSurfaceCard } from '../profile-surface-card'
import { MatchingCtaCard } from './matching-cta-card'
import { MatchingLoadingSkeleton } from './matching-loading-skeleton'
import { MatchingPreferenceInsights } from './matching-preference-insights'
import { RecommendedProjectCard } from './recommended-project-card'

const isNotEnoughCandidatesError = (message: string | null): boolean => {
	if (!message) return false
	return message.toLowerCase().includes('not enough active projects')
}

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

	const showError = isExpanded && status === 'error'
	const showResultsPanel = isExpanded && status !== 'idle'
	const notEnoughCandidates = isNotEnoughCandidatesError(errorMessage)

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
						{...getFadeInAnimateProps(prefersReducedMotion)}
						exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
					>
						<MatchingCtaCard onActivate={handleActivate} />
					</motion.div>
				) : (
					<motion.div
						key="results"
						{...getFadeInAnimateProps(prefersReducedMotion)}
						exit={prefersReducedMotion ? undefined : { opacity: 0 }}
						className="space-y-5"
					>
						<ProfileSurfaceCard>
							<div className="mb-5 flex items-start justify-between gap-3">
								<div className="flex items-center gap-2">
									<div className="rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 text-white">
										<Sparkles className="h-4 w-4" aria-hidden="true" />
									</div>
									<div>
										<h3 className="text-base font-semibold">{t('profile.matchingResultsTitle')}</h3>
										{isLoading ? (
											<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
												{t('profile.matchingLoading')}
											</p>
										) : status === 'done' && result ? (
											<p className="text-xs text-emerald-600">
												{result.recommendations.length} {t('profile.matchingMatchesLabel')}
											</p>
										) : null}
									</div>
								</div>

								<div className="flex items-center gap-1">
									{status === 'done' ? (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={handleRetry}
											aria-label={t('profile.matchingRefresh')}
											className="h-8 w-8 text-muted-foreground hover:text-foreground"
										>
											<RefreshCw className="h-4 w-4" />
										</Button>
									) : null}
									{!isLoading ? (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={handleDismiss}
											aria-label={t('profile.matchingDismiss')}
											className="h-8 w-8 text-muted-foreground hover:text-foreground"
										>
											<X className="h-4 w-4" />
										</Button>
									) : null}
								</div>
							</div>

							{isLoading ? (
								<div className="space-y-4" aria-live="polite" aria-busy="true">
									<p className="text-sm text-muted-foreground">
										{t('profile.matchingLoadingHint')}
									</p>
									<MatchingLoadingSkeleton />
								</div>
							) : null}

							{showError ? (
								<div className="space-y-4">
									<div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3">
										<AlertCircle
											className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
											aria-hidden="true"
										/>
										<p className="text-sm text-destructive">
											{notEnoughCandidates
												? t('profile.matchingNotEnoughProjects')
												: (errorMessage ?? t('profile.matchingError'))}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
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
										{notEnoughCandidates ? (
											<Button asChild size="sm" className="rounded-full">
												<Link href="/projects">{t('profile.matchingBrowseProjects')}</Link>
											</Button>
										) : null}
									</div>
								</div>
							) : null}

							{showResultsPanel && status === 'done' && result ? (
								<div className="space-y-5">
									<p className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
										{result.summary}
									</p>

									<MatchingPreferenceInsights insights={result.preferenceInsights} />

									<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{result.recommendations.map((project, index) => (
											<RecommendedProjectCard
												key={project.projectId}
												project={project}
												rank={index + 1}
											/>
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
