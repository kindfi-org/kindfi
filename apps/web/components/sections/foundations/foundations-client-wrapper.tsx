'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { EmptyFoundations } from '~/components/sections/foundations/empty-foundations'
import { FoundationsSortDropdown } from '~/components/sections/foundations/filters/foundations-sort-dropdown'
import { FoundationCard } from '~/components/sections/foundations/foundation-card'
import { FoundationCardGridSkeleton } from '~/components/sections/foundations/skeletons/foundation-card-grid-skeleton'
import { SectionContainer } from '~/components/shared/section-container'
import { staggerContainer } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import {
	type FoundationListSortSlug,
	getAllFoundations,
	normalizeFoundationListSort,
} from '~/lib/queries/foundations/get-all-foundations'

const formatResultsCount = (count: number, t: (key: string) => string) => {
	if (count === 1) {
		return t('foundations.resultsCountOne').replace('{count}', String(count))
	}
	return t('foundations.resultsCountMany').replace('{count}', String(count))
}

export function FoundationsClientWrapper() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t, language } = useI18n()
	const reducedMotion = useReducedMotion()
	const sortSlug = normalizeFoundationListSort(searchParams.get('sort'))

	const {
		data: foundations = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'foundations',
		(client) => getAllFoundations(client, sortSlug, undefined, { viewerLocale: language }),
		{
			additionalKeyValues: [sortSlug, language],
		},
	)

	const handleSortChange = (newSort: FoundationListSortSlug) => {
		const params = new URLSearchParams(searchParams.toString())
		if (newSort === 'most-recent') {
			params.delete('sort')
		} else {
			params.set('sort', newSort)
		}
		const query = params.toString()
		router.push(query ? `/foundations?${query}` : '/foundations', { scroll: false })
	}

	if (error) {
		return (
			<SectionContainer withPadding={false} className="px-4 py-16 sm:px-6 lg:px-8">
				<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center text-destructive">
					<p className="font-semibold">{t('foundations.errorTitle')}</p>
					<p className="mt-2 text-sm opacity-90">{t('foundations.errorDescription')}</p>
					<p className="mt-2 text-xs">
						{t('common.error')}: {error.message}
					</p>
				</div>
			</SectionContainer>
		)
	}

	return (
		<section id="foundations-results" className="bg-white pb-10 pt-2 sm:pb-12 md:pb-14">
			<SectionContainer withPadding={false} className="px-4 sm:px-6 lg:px-8">
				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700/80">
							{t('foundations.resultsEyebrow')}
						</p>
						<p className="mt-1 text-lg font-semibold text-slate-900">
							{isLoading ? t('foundations.loading') : formatResultsCount(foundations.length, t)}
						</p>
					</div>
					<FoundationsSortDropdown value={sortSlug} onChange={handleSortChange} />
				</div>

				<AnimatePresence mode="wait">
					<motion.div
						key={sortSlug}
						initial={reducedMotion ? false : { opacity: 0 }}
						animate={reducedMotion ? false : { opacity: 1 }}
						exit={reducedMotion ? undefined : { opacity: 0 }}
						transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
					>
						{isLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
									<FoundationCardGridSkeleton key={i} />
								))}
							</div>
						) : foundations.length === 0 ? (
							<EmptyFoundations />
						) : (
							<motion.div
								className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
								variants={reducedMotion ? undefined : staggerContainer}
								initial={reducedMotion ? false : 'initial'}
								animate={reducedMotion ? false : 'animate'}
								role="feed"
								aria-label={t('foundations.resultsEyebrow')}
							>
								{foundations.map((foundation) => (
									<FoundationCard key={foundation.id} foundation={foundation} />
								))}
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>
			</SectionContainer>
		</section>
	)
}
