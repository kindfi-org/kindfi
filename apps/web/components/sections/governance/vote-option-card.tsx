'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import type { GovernanceOption, VoteType } from '~/lib/governance/types'
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
}: VoteOptionCardProps) {
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
			transition={{ duration: 0.2 }}
		>
			<Card
				className={cn(
					'overflow-hidden transition-all duration-200',
					option.user_voted && 'ring-2 ring-primary/40',
					isWinner && 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/10',
				)}
			>
				{/* Winner banner */}
				{isWinner && (
					<div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 flex items-center gap-2">
						<span className="text-xs font-bold text-yellow-900 uppercase tracking-wider">
							🏆 Winner
						</span>
					</div>
				)}

				<div className="flex flex-col sm:flex-row">
					{/* Image */}
					{option.image_url && (
						<div className="relative w-full sm:w-32 h-32 sm:h-auto bg-muted shrink-0">
							<Image
								src={option.image_url}
								alt={option.title}
								fill
								className="object-cover"
								unoptimized
							/>
						</div>
					)}

					<CardContent className="flex-1 p-4 space-y-3">
						{/* Header */}
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0">
								<h3 className="font-semibold text-base leading-tight">
									{option.title}
								</h3>
								{option.description && (
									<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
										{option.description}
									</p>
								)}
							</div>
							{option.project_slug && (
								<Link
									href={`/projects/${option.project_slug}`}
									className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
								>
									<ExternalLink className="h-3 w-3" />
									Project
								</Link>
							)}
						</div>

						{/* Vote weight bar */}
						{(roundStatus === 'active' || roundStatus === 'ended') &&
							totalRoundWeight > 0 && (
								<div>
									<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
										<span>
											{upWeight} weighted upvote
											{upWeight !== 1 ? 's' : ''}
										</span>
										<span className="font-medium text-foreground">
											{allocationPercent}% projected
										</span>
									</div>
									<div className="h-2 rounded-full bg-muted overflow-hidden">
										<motion.div
											className={cn(
												'h-full rounded-full',
												isWinner
													? 'bg-gradient-to-r from-yellow-400 to-amber-500'
													: 'bg-primary',
											)}
											initial={{ width: 0 }}
											animate={{ width: `${allocationPercent}%` }}
											transition={{ duration: 0.6, ease: 'easeOut' }}
										/>
									</div>
								</div>
							)}

						{/* Stats row */}
						<div className="flex items-center gap-3 flex-wrap">
							<div className="flex items-center gap-1 text-sm">
								<ThumbsUp className="h-3.5 w-3.5 text-green-500" />
								<span className="font-medium">{upWeight}</span>
								<span className="text-muted-foreground text-xs">weight</span>
							</div>
							<div className="flex items-center gap-1 text-sm">
								<ThumbsDown className="h-3.5 w-3.5 text-red-400" />
								<span className="font-medium">{downWeight}</span>
								<span className="text-muted-foreground text-xs">weight</span>
							</div>
							{netWeight !== 0 && (
								<Badge
									variant="outline"
									className={cn(
										'text-xs',
										netWeight > 0
											? 'border-green-300 text-green-700'
											: 'border-red-300 text-red-600',
									)}
								>
									{netWeight > 0 ? '+' : ''}
									{netWeight} net
								</Badge>
							)}
							{option.user_voted && (
								<Badge
									variant="outline"
									className="text-xs border-primary/40 text-primary"
								>
									Your vote:{' '}
									{option.user_vote_type === 'up' ? '👍 Up' : '👎 Down'}
								</Badge>
							)}
						</div>

						{/* Vote buttons */}
						{roundStatus === 'active' && !hasVotedInRound && (
							<div className="flex items-center gap-2 pt-1">
								<Button
									size="sm"
									variant="outline"
									onClick={() => castVote('up')}
									disabled={!canVote}
									className="gap-1.5 hover:border-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
								>
									<ThumbsUp className="h-3.5 w-3.5" />
									Upvote
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => castVote('down')}
									disabled={!canVote}
									className="gap-1.5 hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
								>
									<ThumbsDown className="h-3.5 w-3.5" />
									Downvote
								</Button>
								{!isEligible && (
									<p className="text-xs text-muted-foreground">
										Requires Kinders NFT
									</p>
								)}
							</div>
						)}
					</CardContent>
				</div>
			</Card>
		</motion.div>
	)
}
