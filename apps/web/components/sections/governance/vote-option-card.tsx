'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
	CheckCircle2,
	ExternalLink,
	Heart,
	Loader2,
	MinusCircle,
	Trophy,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import type { GovernanceOption, VoteType } from '~/lib/governance/types'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

interface VoteOptionCardProps {
	option: GovernanceOption
	roundId: string
	roundStatus: 'upcoming' | 'active' | 'ended'
	isEligible: boolean
	hasVotedInRound: boolean
	totalRoundWeight: number
	allocationPercent: number
	isWinner?: boolean
	index?: number
}

export function VoteOptionCard({
	option,
	roundId,
	roundStatus,
	isEligible,
	hasVotedInRound,
	totalRoundWeight,
	allocationPercent,
	isWinner,
	index = 0,
}: VoteOptionCardProps) {
	const { t } = useI18n()
	const queryClient = useQueryClient()

	const { mutate: castVote, isPending } = useMutation({
		mutationFn: async (voteType: VoteType) => {
			const res = await fetch('/api/governance/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					roundId,
					optionId: option.id,
					voteType,
				}),
			})
			const json = await res.json()
			if (!res.ok) throw new Error(json.error ?? 'Failed to vote')
			return json
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['governance-round', roundId],
			})
			queryClient.invalidateQueries({ queryKey: ['governance-rounds'] })
		},
	})

	const canVote =
		roundStatus === 'active' && isEligible && !hasVotedInRound && !isPending

	const upWeight = option.weighted_upvotes ?? 0
	const downWeight = option.weighted_downvotes ?? 0
	const netWeight = upWeight - downWeight

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
		>
			<div
				className={cn(
					'overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/40 transition-all duration-200',
					option.user_voted &&
						'border-emerald-200/80 ring-2 ring-emerald-100',
					isWinner &&
						'border-amber-200/80 ring-2 ring-amber-100 shadow-md shadow-amber-100/40',
				)}
			>
				{isWinner ? (
					<div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-50 px-4 py-2.5">
						<Trophy className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
						<span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
							{t('governancePage.winnerBanner')}
						</span>
					</div>
				) : null}

				<div className="flex flex-col sm:flex-row">
					{option.image_url ? (
						<div className="relative h-36 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-36">
							<Image
								src={option.image_url}
								alt={option.title}
								fill
								className="object-cover"
								unoptimized
							/>
						</div>
					) : null}

					<div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 space-y-1">
								<h3 className="text-base font-semibold leading-tight text-slate-900">
									{option.title}
								</h3>
								{option.description ? (
									<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
										{option.description}
									</p>
								) : null}
							</div>
							{option.project_slug ? (
								<Link
									href={`/projects/${option.project_slug}`}
									className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
								>
									<ExternalLink className="h-3 w-3" aria-hidden="true" />
									{t('governancePage.viewProject')}
								</Link>
							) : null}
						</div>

						{(roundStatus === 'active' || roundStatus === 'ended') &&
						totalRoundWeight > 0 ? (
							<div className="space-y-1.5">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">
										{upWeight}{' '}
										{t('governancePage.weightedUpvotes')}
									</span>
									<span className="font-semibold tabular-nums text-slate-900">
										{allocationPercent}% {t('governancePage.allocation')}
									</span>
								</div>
								<div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
									<motion.div
										className={cn(
											'h-full rounded-full',
											isWinner
												? 'bg-gradient-to-r from-amber-400 to-amber-500'
												: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
										)}
										initial={{ width: 0 }}
										animate={{ width: `${allocationPercent}%` }}
										transition={{ duration: 0.7, ease: 'easeOut' }}
									/>
								</div>
							</div>
						) : null}

						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap items-center gap-3">
								<div className="flex items-center gap-1.5 text-sm">
									<Heart
										className="h-3.5 w-3.5 text-emerald-600"
										aria-hidden="true"
									/>
									<span className="font-semibold tabular-nums text-slate-900">
										{upWeight}
									</span>
								</div>
								<div className="flex items-center gap-1.5 text-sm">
									<MinusCircle
										className="h-3.5 w-3.5 text-slate-400"
										aria-hidden="true"
									/>
									<span className="font-semibold tabular-nums text-slate-600">
										{downWeight}
									</span>
								</div>
								{netWeight !== 0 ? (
									<Badge
										variant="outline"
										className={cn(
											'text-xs tabular-nums',
											netWeight > 0
												? 'border-emerald-200 bg-emerald-50 text-emerald-800'
												: 'border-slate-200 bg-slate-50 text-slate-600',
										)}
									>
										{netWeight > 0 ? '+' : ''}
										{netWeight}
									</Badge>
								) : null}
								{option.user_voted ? (
									<Badge
										variant="outline"
										className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-800"
									>
										<CheckCircle2 className="h-3 w-3" aria-hidden="true" />
										{option.user_vote_type === 'up'
											? t('governancePage.votedUp')
											: t('governancePage.votedDown')}
									</Badge>
								) : null}
							</div>

							{roundStatus === 'active' && !hasVotedInRound ? (
								<div className="flex items-center gap-2">
									{!isEligible ? (
										<p className="mr-1 text-xs text-muted-foreground">
											{t('governancePage.nftRequired')}
										</p>
									) : null}
									<Button
										size="sm"
										variant="outline"
										onClick={() => castVote('up')}
										disabled={!canVote}
										className="h-9 gap-1.5 rounded-full border-emerald-200 bg-white px-4 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
									>
										{isPending ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<Heart className="h-3.5 w-3.5" />
										)}
										{t('governancePage.upvote')}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => castVote('down')}
										disabled={!canVote}
										className="h-9 gap-1.5 rounded-full border-slate-200 bg-white px-4 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
									>
										{isPending ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<MinusCircle className="h-3.5 w-3.5" />
										)}
										{t('governancePage.downvote')}
									</Button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
