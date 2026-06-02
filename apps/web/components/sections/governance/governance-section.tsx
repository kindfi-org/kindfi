'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Heart, History, ShieldCheck, Vote } from 'lucide-react'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '~/components/base/tabs'
import { SectionContainer } from '~/components/shared/section-container'
import type { CommunityFundBalance, GovernanceRound } from '~/lib/governance/types'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { CommunityFundBalance as FundBalanceWidget } from './community-fund-balance'
import { EligibilityBadge } from './eligibility-badge'
import { GovernanceRoundCard } from './governance-round-card'

interface RoundsResponse {
	success: boolean
	data: GovernanceRound[]
}

interface BalanceResponse {
	success: boolean
	data: CommunityFundBalance
}

const TAB_TRIGGER_CLASS = cn(
	'rounded-full px-4 py-2 text-sm font-medium transition-all',
	'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
	'data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-gray-800',
)

export function GovernanceSection() {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()
	const [activeTab, setActiveTab] = useState('active')

	const { data: balanceData } = useQuery<BalanceResponse>({
		queryKey: ['community-fund-balance'],
		queryFn: async () => {
			const res = await fetch('/api/governance/balance')
			if (!res.ok) throw new Error('Failed')
			return res.json()
		},
		staleTime: 30_000,
	})

	const { data: allRoundsData, isLoading } = useQuery<RoundsResponse>({
		queryKey: ['governance-rounds'],
		queryFn: async () => {
			const res = await fetch('/api/governance/rounds')
			if (!res.ok) throw new Error('Failed to fetch rounds')
			return res.json()
		},
		refetchInterval: 60_000,
	})

	const allRounds = allRoundsData?.data ?? []
	const activeRounds = allRounds.filter((r) => r.status === 'active' || r.status === 'upcoming')
	const pastRounds = allRounds.filter((r) => r.status === 'ended')
	const fundBalance = balanceData?.data?.balance

	const howItWorksSteps = [
		{
			title: t('governancePage.step1Title'),
			description: t('governancePage.step1Description'),
		},
		{
			title: t('governancePage.step2Title'),
			description: t('governancePage.step2Description'),
		},
		{
			title: t('governancePage.step3Title'),
			description: t('governancePage.step3Description'),
		},
	]

	return (
		<>
			<section
				className="relative isolate w-full overflow-hidden bg-[#fafbfc] pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16"
				aria-labelledby="governance-page-title"
			>
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
					<div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
					<div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />
				</div>

				<SectionContainer className="relative" maxWidth="6xl">
					<motion.div
						className="mx-auto max-w-3xl text-center"
						initial={reducedMotion ? false : { opacity: 0, y: 16 }}
						animate={reducedMotion ? false : { opacity: 1, y: 0 }}
						transition={
							reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
						}
					>
						<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
							{t('governancePage.eyebrow')}
						</p>
						<h1
							id="governance-page-title"
							className="text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
						>
							{t('governancePage.title')}{' '}
							<span className="gradient-text">{t('governancePage.titleHighlight')}</span>
						</h1>
						<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
							{t('governancePage.subtitle')}
						</p>
						<p className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[13px]">
							<ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
							{t('governancePage.trustLine')}
						</p>
					</motion.div>

					<div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
						{howItWorksSteps.map((step, index) => (
							<div
								key={step.title}
								className="rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-5 text-center shadow-sm backdrop-blur-sm"
							>
								<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700/80">
									{String(index + 1).padStart(2, '0')}
								</p>
								<p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</SectionContainer>

				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
			</section>

			<section className="bg-white pb-12 pt-2 sm:pb-16 md:pb-20">
				<SectionContainer maxWidth="6xl" className="space-y-8">
					<div className="grid gap-5 lg:grid-cols-2">
						<FundBalanceWidget />
						<EligibilityBadge />
					</div>

					<div className="space-y-5">
						<div className="max-w-2xl">
							<p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700/80">
								{t('governancePage.roundsEyebrow')}
							</p>
							<h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
								{t('governancePage.roundsSectionTitle')}
							</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
								{t('governancePage.roundsSectionDescription')}
							</p>
						</div>

						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<div className="overflow-x-auto pb-1">
								<TabsList className="inline-flex h-auto w-max min-w-full gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 p-1.5 shadow-sm sm:min-w-0">
									<TabsTrigger value="active" className={TAB_TRIGGER_CLASS}>
										<Vote className="mr-2 h-4 w-4" aria-hidden="true" />
										{t('governancePage.tabActive')}
										{activeRounds.length > 0 ? (
											<span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
												{activeRounds.length}
											</span>
										) : null}
									</TabsTrigger>
									<TabsTrigger value="past" className={TAB_TRIGGER_CLASS}>
										<History className="mr-2 h-4 w-4" aria-hidden="true" />
										{t('governancePage.tabPast')}
										{pastRounds.length > 0 ? (
											<span className="ml-2 text-xs text-slate-500">({pastRounds.length})</span>
										) : null}
									</TabsTrigger>
								</TabsList>
							</div>

							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={activeTab}
									initial={reducedMotion ? false : { opacity: 0, y: 10 }}
									animate={reducedMotion ? false : { opacity: 1, y: 0 }}
									exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
									transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
									className="mt-6"
								>
									{activeTab === 'active' ? (
										isLoading ? (
											<LoadingSkeleton />
										) : activeRounds.length === 0 ? (
											<EmptyState
												icon={Heart}
												title={t('governancePage.emptyActiveTitle')}
												description={t('governancePage.emptyActiveDescription')}
											/>
										) : (
											<div className="space-y-8">
												{activeRounds.map((round) => (
													<GovernanceRoundCard
														key={round.id}
														roundId={round.id}
														fundBalance={fundBalance}
													/>
												))}
											</div>
										)
									) : isLoading ? (
										<LoadingSkeleton />
									) : pastRounds.length === 0 ? (
										<EmptyState
											icon={History}
											title={t('governancePage.emptyPastTitle')}
											description={t('governancePage.emptyPastDescription')}
										/>
									) : (
										<div className="space-y-8">
											{pastRounds.map((round) => (
												<GovernanceRoundCard
													key={round.id}
													roundId={round.id}
													fundBalance={fundBalance}
												/>
											))}
										</div>
									)}
								</motion.div>
							</AnimatePresence>
						</Tabs>
					</div>
				</SectionContainer>
			</section>
		</>
	)
}

function LoadingSkeleton() {
	return (
		<div className="space-y-6">
			{[1, 2].map((i) => (
				<div
					key={i}
					className="h-48 animate-pulse rounded-2xl border border-slate-200/60 bg-emerald-50/40"
				/>
			))}
		</div>
	)
}

function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ComponentType<{ className?: string }>
	title: string
	description: string
}) {
	return (
		<div className="rounded-2xl border border-dashed border-slate-200/80 bg-[#fafbfc] px-6 py-16 text-center">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
				<Icon className="h-7 w-7" aria-hidden="true" />
			</div>
			<p className="mt-5 text-lg font-semibold text-slate-900">{title}</p>
			<p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
				{description}
			</p>
		</div>
	)
}
