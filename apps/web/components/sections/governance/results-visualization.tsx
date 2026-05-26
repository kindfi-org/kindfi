'use client'

import { motion } from 'framer-motion'
import { BarChart3, Heart, MinusCircle, Trophy, Users } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import type { GovernanceRound } from '~/lib/governance/types'
import { calcAllocationPercents } from '~/lib/governance/vote-weight'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

interface ResultsVisualizationProps {
	round: GovernanceRound
	totalVoters: number
	fundBalance?: number
}

export function ResultsVisualization({
	round,
	totalVoters,
	fundBalance,
}: ResultsVisualizationProps) {
	const { t } = useI18n()
	const options = round.options ?? []
	const isEnded = round.status === 'ended'
	const isActive = round.status === 'active'

	const allocationPercents = calcAllocationPercents(
		options.map((o) => ({
			id: o.id,
			weighted_upvotes: o.weighted_upvotes,
		})),
	)

	const totalWeight = options.reduce(
		(sum, o) => sum + (o.weighted_upvotes ?? 0),
		0,
	)

	const sortedOptions = [...options].sort(
		(a, b) => (b.weighted_upvotes ?? 0) - (a.weighted_upvotes ?? 0),
	)

	const winner = sortedOptions[0]
	const hasVotes = totalWeight > 0
	const fundAmount = Number(round.total_fund_amount || fundBalance || 0)

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/50">
			<div className="border-b border-slate-100 px-6 py-5 sm:px-7">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h4 className="flex items-center gap-2 text-base font-semibold text-slate-900">
						<BarChart3
							className="h-4 w-4 text-emerald-600"
							aria-hidden="true"
						/>
						{isEnded
							? t('governancePage.finalResults')
							: t('governancePage.liveStandings')}
					</h4>
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Users className="h-3.5 w-3.5" aria-hidden="true" />
							{t('governancePage.votesCount').replace(
								'{count}',
								String(totalVoters),
							)}
						</span>
						{fundAmount > 0 ? (
							<Badge
								variant="outline"
								className="border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-800"
							>
								{fundAmount.toLocaleString('en-US', {
									maximumFractionDigits: 2,
								})}{' '}
								{round.fund_currency}
							</Badge>
						) : null}
					</div>
				</div>
			</div>

			<div className="space-y-5 px-6 py-5 sm:px-7">
				{isEnded && winner && hasVotes ? (
					<div className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-yellow-50 p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
							<Trophy className="h-5 w-5 text-amber-700" aria-hidden="true" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
								{t('governancePage.winnerLabel')}
							</p>
							<p className="truncate text-sm font-semibold text-slate-900">
								{winner.title}
							</p>
							{fundAmount > 0 ? (
								<p className="mt-0.5 text-xs text-muted-foreground">
									{t('governancePage.allocatedLabel')}{' '}
									<span className="font-semibold text-slate-900">
										{fundAmount.toLocaleString('en-US', {
											maximumFractionDigits: 2,
										})}{' '}
										{round.fund_currency}
									</span>
								</p>
							) : null}
						</div>
					</div>
				) : null}

				{!hasVotes ? (
					<p className="py-6 text-center text-sm text-muted-foreground">
						{isActive
							? t('governancePage.noVotesActive')
							: t('governancePage.noVotesEnded')}
					</p>
				) : null}

				{hasVotes ? (
					<div className="space-y-4">
						{sortedOptions.map((opt, i) => {
							const pct = allocationPercents[opt.id] ?? 0
							const upW = opt.weighted_upvotes ?? 0
							const downW = opt.weighted_downvotes ?? 0
							const isTop = i === 0
							const allocatedFund =
								fundAmount > 0 ? (pct / 100) * fundAmount : null

							return (
								<div key={opt.id} className="space-y-1.5">
									<div className="flex items-center justify-between gap-2 text-sm">
										<div className="flex min-w-0 items-center gap-2">
											<span
												className={cn(
													'w-5 text-center text-xs font-semibold tabular-nums',
													isTop
														? 'text-amber-600'
														: 'text-muted-foreground',
												)}
											>
												{isTop && hasVotes ? (
													<Trophy
														className="inline h-3.5 w-3.5"
														aria-hidden="true"
													/>
												) : (
													`#${i + 1}`
												)}
											</span>
											<span className="truncate font-medium text-slate-900">
												{opt.title}
											</span>
											{opt.user_voted ? (
												<Badge
													variant="outline"
													className="h-4 shrink-0 border-emerald-200 bg-emerald-50 px-1 py-0 text-[10px] text-emerald-800"
												>
													{t('governancePage.youLabel')}
												</Badge>
											) : null}
										</div>
										<div className="flex shrink-0 items-center gap-2.5">
											{allocatedFund !== null ? (
												<span className="text-xs tabular-nums text-muted-foreground">
													{allocatedFund.toLocaleString('en-US', {
														maximumFractionDigits: 0,
													})}{' '}
													{round.fund_currency}
												</span>
											) : null}
											<span className="w-10 text-right text-sm font-bold tabular-nums text-slate-900">
												{pct}%
											</span>
										</div>
									</div>

									<div className="h-3 overflow-hidden rounded-full bg-slate-100">
										<motion.div
											className={cn(
												'h-full rounded-full',
												isTop && hasVotes
													? 'bg-gradient-to-r from-amber-400 to-amber-500'
													: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
											)}
											initial={{ width: 0 }}
											animate={{ width: `${pct}%` }}
											transition={{
												duration: 0.8,
												ease: 'easeOut',
												delay: i * 0.1,
											}}
										/>
									</div>

									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										<span className="inline-flex items-center gap-1 tabular-nums">
											<Heart
												className="h-3 w-3 text-emerald-600"
												aria-hidden="true"
											/>
											{upW}
										</span>
										<span className="inline-flex items-center gap-1 tabular-nums">
											<MinusCircle
												className="h-3 w-3 text-slate-400"
												aria-hidden="true"
											/>
											{downW}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				) : null}

				{isActive && hasVotes && fundAmount > 0 ? (
					<p className="border-t border-slate-100 pt-3 text-center text-xs text-muted-foreground">
						{t('governancePage.projectedAllocationNote')}
					</p>
				) : null}
			</div>
		</div>
	)
}
