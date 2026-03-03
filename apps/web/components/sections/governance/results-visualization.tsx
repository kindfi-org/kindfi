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
import type { GovernanceOption, GovernanceRound } from '~/lib/governance/types'
import { calcAllocationPercents } from '~/lib/governance/vote-weight'
import { cn } from '~/lib/utils'

interface ResultsVisualizationProps {
	round: GovernanceRound
	totalVoters: number
	fundBalance?: string
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
				<CardTitle className="flex items-center gap-2 text-base">
					<BarChart3 className="h-4 w-4 text-muted-foreground" />
					{isEnded ? 'Final Results' : 'Live Vote Standings'}
				</CardTitle>
				<div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mt-1">
					<span className="flex items-center gap-1">
						<Users className="h-3.5 w-3.5" />
						{totalVoters} voter{totalVoters !== 1 ? 's' : ''}
					</span>
					<span>{totalWeight} total weighted votes</span>
					{fundAmount > 0 && (
						<span className="font-medium text-foreground">
							{fundAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
							{round.fund_currency} to redistribute
						</span>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Winner announcement */}
				{isEnded && winner && hasVotes && (
					<div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-300/30">
						<Trophy className="h-6 w-6 text-yellow-500 shrink-0" />
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">
								Winner
							</p>
							<p className="font-semibold text-sm truncate">{winner.title}</p>
							{fundAmount > 0 && (
								<p className="text-xs text-muted-foreground">
									Receives{' '}
									<span className="font-medium text-foreground">
										{fundAmount.toLocaleString('en-US', {
											maximumFractionDigits: 2,
										})}{' '}
										{round.fund_currency}
									</span>{' '}
									from the community fund
								</p>
							)}
						</div>
					</div>
				)}

				{/* No votes yet */}
				{!hasVotes && (
					<p className="text-sm text-muted-foreground text-center py-4">
						{isActive
							? 'No votes cast yet. Be the first!'
							: 'No votes were cast in this round.'}
					</p>
				)}

				{/* Bar chart per option */}
				{hasVotes && (
					<div className="space-y-3">
						{sortedOptions.map((opt, i) => {
							const pct = allocationPercents[opt.id] ?? 0
							const upW = opt.weighted_upvotes ?? 0
							const isTop = i === 0
							const allocatedFund =
								fundAmount > 0 ? (pct / 100) * fundAmount : null

							return (
								<div key={opt.id} className="space-y-1">
									<div className="flex items-center justify-between gap-2 text-sm">
										<div className="flex items-center gap-2 min-w-0">
											{isTop && hasVotes && (
												<span className="shrink-0 text-yellow-500">🏆</span>
											)}
											<span className="font-medium truncate">{opt.title}</span>
											{opt.user_voted && (
												<Badge
													variant="outline"
													className="text-[10px] px-1 py-0 h-4 border-primary/40 text-primary shrink-0"
												>
													yours
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2 shrink-0">
											{allocatedFund !== null && (
												<span className="text-xs text-muted-foreground">
													≈{' '}
													{allocatedFund.toLocaleString('en-US', {
														maximumFractionDigits: 0,
													})}{' '}
													{round.fund_currency}
												</span>
											)}
											<span className="font-semibold tabular-nums">{pct}%</span>
										</div>
									</div>

									<div className="h-2.5 rounded-full bg-muted overflow-hidden">
										<motion.div
											className={cn(
												'h-full rounded-full',
												isTop && hasVotes
													? 'bg-gradient-to-r from-yellow-400 to-amber-500'
													: 'bg-primary/60',
											)}
											initial={{ width: 0 }}
											animate={{ width: `${pct}%` }}
											transition={{
												duration: 0.7,
												ease: 'easeOut',
												delay: i * 0.1,
											}}
										/>
									</div>

									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										<span>👍 {upW} weighted upvotes</span>
										<span>
											👎 {opt.weighted_downvotes ?? 0} weighted downvotes
										</span>
									</div>
								</div>
							)
						})}
					</div>
				)}

				{/* Fund allocation note */}
				{isActive && hasVotes && fundAmount > 0 && (
					<p className="text-xs text-muted-foreground border-t pt-3">
						Projected allocation based on current vote standings. Final
						redistribution is calculated when the round ends.
					</p>
				)}
			</CardContent>
		</Card>
	)
}
