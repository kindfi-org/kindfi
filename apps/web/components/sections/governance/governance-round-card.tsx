'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
	Calendar,
	Clock,
	ExternalLink,
	Loader2,
	Users,
	Vote,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { EligibilityResult, GovernanceRound } from '~/lib/governance/types'
import { calcAllocationPercents } from '~/lib/governance/vote-weight'
import { cn } from '~/lib/utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'
import { ResultsVisualization } from './results-visualization'
import { VoteOptionCard } from './vote-option-card'

interface GovernanceRoundCardProps {
	roundId: string
	fundBalance?: number
}

const STATUS_CONFIG = {
	upcoming: {
		label: 'Upcoming',
		className: 'border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/30',
		dot: 'bg-blue-400',
	},
	active: {
		label: 'Voting Open',
		className:
			'border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30',
		dot: 'bg-green-500 animate-pulse',
	},
	ended: {
		label: 'Ended',
		className: 'border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-900/40',
		dot: 'bg-gray-400',
	},
} as const

function formatTimeRemaining(target: Date, now: Date): string {
	const diffMs = target.getTime() - now.getTime()
	const isPast = diffMs < 0
	const absDiffMs = Math.abs(diffMs)

	const mins = Math.floor(absDiffMs / 60_000)
	const hours = Math.floor(mins / 60)
	const days = Math.floor(hours / 24)

	let label: string
	if (days > 0) label = `${days}d ${hours % 24}h`
	else if (hours > 0) label = `${hours}h ${mins % 60}m`
	else label = `${mins}m`

	return isPast ? `${label} ago` : `${label} left`
}

export function GovernanceRoundCard({
	roundId,
	fundBalance,
}: GovernanceRoundCardProps) {
	const { data: session } = useSession()

	const { data: roundData, isLoading: roundLoading } = useQuery<{
		success: boolean
		data: GovernanceRound & {
			user_has_voted: boolean
			user_voted_option_id: string | null
		}
	}>({
		queryKey: ['governance-round', roundId],
		queryFn: async () => {
			const res = await fetch(`/api/governance/rounds/${roundId}`)
			if (!res.ok) throw new Error('Failed to fetch round')
			return res.json()
		},
		refetchInterval: 30_000,
	})

	const { data: eligibility } = useQuery<EligibilityResult>({
		queryKey: ['governance-eligibility', session?.user?.id],
		queryFn: async () => {
			const res = await fetch('/api/governance/eligibility')
			if (!res.ok) throw new Error('Failed to check eligibility')
			return res.json()
		},
		enabled: !!session?.user?.id,
		staleTime: 5 * 60_000,
	})

	if (roundLoading) {
		return (
			<Card className="border-border/60">
				<CardContent className="py-16 flex items-center justify-center">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		)
	}

	const round = roundData?.data
	if (!round) return null

	const options = round.options ?? []
	const statusConfig = STATUS_CONFIG[round.status]
	const isActive = round.status === 'active'
	const isEnded = round.status === 'ended'
	const endsAt = new Date(round.ends_at)
	const startsAt = new Date(round.starts_at)
	const now = new Date()
	const contractAddress =
		process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS ?? ''

	const allocationPercents = calcAllocationPercents(
		options.map((o) => ({ id: o.id, weighted_upvotes: o.weighted_upvotes })),
	)

	const totalWeight = options.reduce(
		(sum, o) => sum + (o.weighted_upvotes ?? 0),
		0,
	)

	const totalVoters =
		options.reduce(
			(sum, o) => sum + (o.upvotes ?? 0) + (o.downvotes ?? 0),
			0,
		)

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-4"
		>
			{/* Round header card */}
			<Card className="overflow-hidden">
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<CardTitle className="text-xl leading-tight">
									{round.title}
								</CardTitle>
								<Badge
									variant="outline"
									className={cn(
										'shrink-0 font-medium gap-1.5',
										statusConfig.className,
									)}
								>
									<span
										className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)}
									/>
									{statusConfig.label}
								</Badge>
							</div>
							{round.description && (
								<p className="text-sm text-muted-foreground leading-relaxed">
									{round.description}
								</p>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-0 pb-5">
					{/* Info row */}
					<div className="flex items-center gap-x-5 gap-y-2 flex-wrap text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							{isEnded ? (
								<Calendar className="h-3.5 w-3.5" />
							) : (
								<Clock className="h-3.5 w-3.5" />
							)}
							{isEnded
								? `Ended ${formatTimeRemaining(endsAt, now)}`
								: startsAt > now
									? `Starts in ${formatTimeRemaining(startsAt, now)}`
									: formatTimeRemaining(endsAt, now)}
						</span>
						<span className="flex items-center gap-1.5">
							<Vote className="h-3.5 w-3.5" />
							{options.length} option{options.length !== 1 ? 's' : ''}
						</span>
						<span className="flex items-center gap-1.5">
							<Users className="h-3.5 w-3.5" />
							{totalVoters} vote{totalVoters !== 1 ? 's' : ''}
						</span>
						{round.total_fund_amount > 0 && (
							<span className="font-semibold text-foreground">
								{Number(round.total_fund_amount).toLocaleString('en-US', {
									maximumFractionDigits: 2,
								})}{' '}
								{round.fund_currency} at stake
							</span>
						)}
						{round.contract_round_id != null && contractAddress && (
							<a
								href={getStellarExplorerUrl(contractAddress)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
							>
								On-chain #{round.contract_round_id}
								<ExternalLink className="h-3 w-3" />
							</a>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Options */}
			{options.length > 0 && (
				<div className="space-y-3">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
						Redistribution Options
					</p>
					{options.map((opt, i) => (
						<VoteOptionCard
							key={opt.id}
							option={opt}
							roundId={round.id}
							roundStatus={round.status}
							isEligible={eligibility?.eligible ?? false}
							hasVotedInRound={round.user_has_voted}
							totalRoundWeight={totalWeight}
							allocationPercent={allocationPercents[opt.id] ?? 0}
							isWinner={isEnded && round.winner_option_id === opt.id}
							index={i}
						/>
					))}
				</div>
			)}

			{/* Results */}
			{(isActive || isEnded) && options.length > 0 && (
				<ResultsVisualization
					round={round}
					totalVoters={totalVoters}
					fundBalance={fundBalance}
				/>
			)}
		</motion.div>
	)
}
