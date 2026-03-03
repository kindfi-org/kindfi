'use client'

import { motion } from 'framer-motion'
import { BarChart3, Trophy, Users } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { GovernanceRound } from '~/lib/governance/types'
import { calcAllocationPercents } from '~/lib/governance/vote-weight'
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
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<CardTitle className="flex items-center gap-2 text-base">
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
						{isEnded ? 'Final Results' : 'Live Standings'}
					</CardTitle>
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Users className="h-3.5 w-3.5" />
							{totalVoters}
						</span>
						{fundAmount > 0 && (
							<Badge variant="outline" className="text-xs font-medium">
								{fundAmount.toLocaleString('en-US', {
									maximumFractionDigits: 2,
								})}{' '}
								{round.fund_currency}
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-5">
				{/* Winner banner */}
				{isEnded && winner && hasVotes && (
					<div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-800/30">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
							<Trophy className="h-5 w-5 text-amber-600" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
								Winner
							</p>
							<p className="font-semibold text-sm truncate">{winner.title}</p>
							{fundAmount > 0 && (
								<p className="text-xs text-muted-foreground mt-0.5">
									Allocated{' '}
									<span className="font-semibold text-foreground">
										{fundAmount.toLocaleString('en-US', {
											maximumFractionDigits: 2,
										})}{' '}
										{round.fund_currency}
									</span>
								</p>
							)}
						</div>
					</div>
				)}

				{/* No votes state */}
				{!hasVotes && (
					<p className="text-sm text-muted-foreground text-center py-6">
						{isActive
							? 'No votes cast yet — be the first to shape the outcome!'
							: 'No votes were cast in this round.'}
					</p>
				)}

				{/* Bar chart */}
				{hasVotes && (
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
										<div className="flex items-center gap-2 min-w-0">
											<span
												className={cn(
													'font-semibold text-xs w-5 text-center tabular-nums',
													isTop
														? 'text-amber-600 dark:text-amber-400'
														: 'text-muted-foreground',
												)}
											>
												{isTop && hasVotes ? (
													<Trophy className="h-3.5 w-3.5 inline" />
												) : (
													`#${i + 1}`
												)}
											</span>
											<span className="font-medium truncate">{opt.title}</span>
											{opt.user_voted && (
												<Badge
													variant="outline"
													className="text-[10px] px-1 py-0 h-4 border-primary/30 text-primary shrink-0"
												>
													you
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2.5 shrink-0">
											{allocatedFund !== null && (
												<span className="text-xs text-muted-foreground tabular-nums">
													{allocatedFund.toLocaleString('en-US', {
														maximumFractionDigits: 0,
													})}{' '}
													{round.fund_currency}
												</span>
											)}
											<span className="font-bold tabular-nums text-sm w-10 text-right">
												{pct}%
											</span>
										</div>
									</div>

									<div className="h-3 rounded-full bg-muted/60 overflow-hidden">
										<motion.div
											className={cn(
												'h-full rounded-full',
												isTop && hasVotes
													? 'bg-gradient-to-r from-amber-400 to-yellow-500'
													: 'bg-primary/50',
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

									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span className="tabular-nums">
											{upW} up · {downW} down
										</span>
									</div>
								</div>
							)
						})}
					</div>
				)}

				{/* Footer note */}
				{isActive && hasVotes && fundAmount > 0 && (
					<p className="text-xs text-muted-foreground border-t pt-3 text-center">
						Projected allocation based on current standings. Final
						redistribution calculated when the round ends.
					</p>
				)}
			</CardContent>
		</Card>
	)
}
