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
import { useI18n } from '~/lib/i18n'
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

const STATUS_STYLES = {
	upcoming: {
		className: 'border-sky-200 bg-sky-50 text-sky-700',
		dot: 'bg-sky-400',
	},
	active: {
		className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
		dot: 'bg-emerald-500 animate-pulse',
	},
	ended: {
		className: 'border-slate-200 bg-slate-50 text-slate-600',
		dot: 'bg-slate-400',
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
	const { t } = useI18n()
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
			<div className="rounded-2xl border border-slate-200/70 bg-white/90 p-16 shadow-sm">
				<div className="flex items-center justify-center">
					<Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
				</div>
			</div>
		)
	}

	const round = roundData?.data
	if (!round) return null

	const options = round.options ?? []
	const statusStyles = STATUS_STYLES[round.status]
	const statusLabel =
		round.status === 'upcoming'
			? t('governancePage.statusUpcoming')
			: round.status === 'active'
				? t('governancePage.statusActive')
				: t('governancePage.statusEnded')
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
			<div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/50">
				<div className="border-b border-slate-100 px-6 py-5 sm:px-7">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
									{round.title}
								</h3>
								<Badge
									variant="outline"
									className={cn(
										'shrink-0 gap-1.5 font-medium',
										statusStyles.className,
									)}
								>
									<span
										className={cn('h-1.5 w-1.5 rounded-full', statusStyles.dot)}
									/>
									{statusLabel}
								</Badge>
							</div>
							{round.description ? (
								<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
									{round.description}
								</p>
							) : null}
						</div>
					</div>
				</div>

				<div className="px-6 py-4 sm:px-7">
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							{isEnded ? (
								<Calendar className="h-3.5 w-3.5" aria-hidden="true" />
							) : (
								<Clock className="h-3.5 w-3.5" aria-hidden="true" />
							)}
							{isEnded
								? `Ended ${formatTimeRemaining(endsAt, now)}`
								: startsAt > now
									? `Starts in ${formatTimeRemaining(startsAt, now)}`
									: formatTimeRemaining(endsAt, now)}
						</span>
						<span className="flex items-center gap-1.5">
							<Vote className="h-3.5 w-3.5" aria-hidden="true" />
							{t('governancePage.optionsCount').replace(
								'{count}',
								String(options.length),
							)}
						</span>
						<span className="flex items-center gap-1.5">
							<Users className="h-3.5 w-3.5" aria-hidden="true" />
							{t('governancePage.votesCount').replace(
								'{count}',
								String(totalVoters),
							)}
						</span>
						{round.total_fund_amount > 0 ? (
							<span className="font-semibold text-slate-900">
								{Number(round.total_fund_amount).toLocaleString('en-US', {
									maximumFractionDigits: 2,
								})}{' '}
								{round.fund_currency} {t('governancePage.atStake')}
							</span>
						) : null}
						{round.contract_round_id != null && contractAddress ? (
							<a
								href={getStellarExplorerUrl(contractAddress)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
							>
								{t('governancePage.onChain')} #{round.contract_round_id}
								<ExternalLink className="h-3 w-3" aria-hidden="true" />
							</a>
						) : null}
					</div>
				</div>
			</div>

			{/* Options */}
			{options.length > 0 ? (
				<div className="space-y-3">
					<p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/80">
						{t('governancePage.redistributionOptions')}
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
			) : null}

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
