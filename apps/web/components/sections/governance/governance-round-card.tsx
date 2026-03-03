'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Clock, Loader2, Vote } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { EligibilityResult, GovernanceRound } from '~/lib/governance/types'

function formatRelative(date: Date, now: Date): string {
	const diffMs = Math.abs(date.getTime() - now.getTime())
	const diffMins = Math.floor(diffMs / 60_000)
	const diffHours = Math.floor(diffMins / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffMins < 1) return 'just now'
	if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
	if (diffHours < 24)
		return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
	return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

import { calcAllocationPercents } from '~/lib/governance/vote-weight'
import { cn } from '~/lib/utils'
import { ResultsVisualization } from './results-visualization'
import { VoteOptionCard } from './vote-option-card'

interface GovernanceRoundCardProps {
	roundId: string
	fundBalance?: string
}

const STATUS_CONFIG = {
	upcoming: {
		label: 'Upcoming',
		className: 'border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/30',
	},
	active: {
		label: 'Voting Open',
		className:
			'border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30',
	},
	ended: {
		label: 'Ended',
		className: 'border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-900/40',
	},
} as const

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
			<Card>
				<CardContent className="py-12 flex items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
	const timeLabel =
		endsAt < now
			? `Ended ${formatRelative(endsAt, now)}`
			: startsAt <= now
				? `Ends ${formatRelative(endsAt, now)}`
				: `Starts ${formatRelative(startsAt, now)}`

	const allocationPercents = calcAllocationPercents(
		options.map((o) => ({ id: o.id, weighted_upvotes: o.weighted_upvotes })),
	)

	const totalWeight = options.reduce(
		(sum, o) => sum + (o.weighted_upvotes ?? 0),
		0,
	)

	// Count total distinct voters from upvotes + downvotes (approx from options)
	const totalVoters =
		round.options?.reduce(
			(sum, o) => sum + (o.upvotes ?? 0) + (o.downvotes ?? 0),
			0,
		) ?? 0

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
			className="space-y-4"
		>
			{/* Round header */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-3 flex-wrap">
						<div className="min-w-0">
							<CardTitle className="text-lg">{round.title}</CardTitle>
							{round.description && (
								<p className="text-sm text-muted-foreground mt-1">
									{round.description}
								</p>
							)}
						</div>
						<Badge
							variant="outline"
							className={cn('shrink-0 font-medium', statusConfig.className)}
						>
							{isActive && (
								<span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
							)}
							{statusConfig.label}
						</Badge>
					</div>

					<div className="flex items-center gap-4 flex-wrap mt-2 text-xs text-muted-foreground">
						<span className="flex items-center gap-1.5">
							{isEnded ? (
								<Calendar className="h-3.5 w-3.5" />
							) : (
								<Clock className="h-3.5 w-3.5" />
							)}
							{timeLabel}
						</span>
						<span className="flex items-center gap-1.5">
							<Vote className="h-3.5 w-3.5" />
							{options.length} option{options.length !== 1 ? 's' : ''}
						</span>
						{round.total_fund_amount > 0 && (
							<span className="font-medium text-foreground">
								{Number(round.total_fund_amount).toLocaleString('en-US', {
									maximumFractionDigits: 2,
								})}{' '}
								{round.fund_currency} at stake
							</span>
						)}
					</div>
				</CardHeader>
			</Card>

			{/* Options */}
			{options.length > 0 && (
				<div className="space-y-3">
					<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
						Redistribution Options
					</p>
					{options.map((opt) => (
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
						/>
					))}
				</div>
			)}

			{/* Results visualization */}
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
