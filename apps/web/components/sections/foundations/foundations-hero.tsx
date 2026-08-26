'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { Plus, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '~/components/base/button'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import {
	type FoundationListSortSlug,
	getAllFoundations,
} from '~/lib/queries/foundations/get-all-foundations'
import { cn } from '~/lib/utils'

interface FoundationsHeroProps {
	sortSlug: FoundationListSortSlug
}

export function FoundationsHero({ sortSlug }: FoundationsHeroProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()

	const { data: foundations = [], isLoading } = useSupabaseQuery(
		'foundations',
		(client) => getAllFoundations(client, sortSlug),
		{ additionalKeyValues: [sortSlug] },
	)

	const activeCampaigns = useMemo(
		() => foundations.reduce((sum, f) => sum + f.totalCampaignsOpen, 0),
		[foundations],
	)

	const totalRaised = useMemo(
		() => foundations.reduce((sum, f) => sum + f.totalDonationsReceived, 0),
		[foundations],
	)

	const formattedRaised = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				notation: 'compact',
				maximumFractionDigits: 1,
			}).format(totalRaised),
		[totalRaised],
	)

	return (
		<section
			className="relative isolate w-full overflow-hidden bg-[#fafbfc] pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24"
			aria-labelledby="foundations-page-title"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				<div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
				<div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />
			</div>

			<SectionContainer className="relative" withPadding>
				<motion.div
					className="mx-auto max-w-4xl text-center"
					initial={reducedMotion ? false : { opacity: 0, y: 16 }}
					animate={reducedMotion ? false : { opacity: 1, y: 0 }}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }
					}
				>
					<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						{t('foundations.pageEyebrow')}
					</p>
					<h1
						id="foundations-page-title"
						className="text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
					>
						{t('foundations.pageTitle')}{' '}
						<span className="gradient-text">{t('foundations.pageTitleHighlight')}</span>
					</h1>
					<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('foundations.pageSubtitle')}
					</p>
					<p className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[13px]">
						<ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
						{t('foundations.pageTrustLine')}
					</p>
					<div className="mt-8 flex justify-center">
						<Button asChild className="gradient-btn rounded-full px-6 text-white shadow-sm">
							<Link href="/create-foundation">
								<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
								{t('foundations.createFoundation')}
							</Link>
						</Button>
					</div>
				</motion.div>

				<section
					className={cn(
						'relative mx-auto mt-12 flex max-w-3xl flex-col items-stretch gap-8 border-t border-slate-200/50 pt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-0 md:mt-14',
						isLoading && 'animate-pulse',
					)}
					aria-label={t('foundations.statsAriaLabel')}
				>
					<HeroStat
						label={t('foundations.statListed')}
						value={isLoading ? null : foundations.length}
					/>
					<HeroStatDivider />
					<HeroStat
						label={t('foundations.statActiveCampaigns')}
						value={isLoading ? null : activeCampaigns}
					/>
					<HeroStatDivider />
					<HeroStat
						label={t('foundations.statTotalRaised')}
						value={isLoading ? null : formattedRaised}
					/>
				</section>
			</SectionContainer>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
		</section>
	)
}

function HeroStat({ label, value }: { label: string; value: number | string | null }) {
	return (
		<div className="flex-1 text-center sm:px-8">
			<p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
				{value ?? '—'}
			</p>
			<p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
				{label}
			</p>
		</div>
	)
}

function HeroStatDivider() {
	return <div className="hidden h-12 w-px shrink-0 bg-slate-200/70 sm:block" aria-hidden="true" />
}
