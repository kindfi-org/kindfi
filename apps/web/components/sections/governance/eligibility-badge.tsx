'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import type { EligibilityResult, NftTier } from '~/lib/governance/types'
import {
	TIER_COLORS,
	TIER_LABELS,
	TIER_VOTE_WEIGHTS,
} from '~/lib/governance/vote-weight'

interface EligibilityResponse extends EligibilityResult {
	error?: string
}

export function EligibilityBadge() {
	const { data: session, status: sessionStatus } = useSession()

	const { data, isLoading } = useQuery<EligibilityResponse>({
		queryKey: ['governance-eligibility', session?.user?.id],
		queryFn: async () => {
			const res = await fetch('/api/governance/eligibility')
			if (!res.ok) throw new Error('Failed to check eligibility')
			return res.json()
		},
		enabled: !!session?.user?.id,
		staleTime: 5 * 60_000,
	})

	if (sessionStatus === 'loading' || isLoading) {
		return (
			<Card className="border-border/60 h-full">
				<CardContent className="p-6 flex items-center justify-center h-full">
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							Checking eligibility…
						</span>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!session?.user?.id) {
		return (
			<Card className="border-border/60 h-full">
				<CardContent className="p-6 flex items-center gap-4 h-full">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
						<Shield className="h-6 w-6 text-muted-foreground" />
					</div>
					<div>
						<p className="text-sm font-semibold">Sign in to vote</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							Connect your wallet to participate in governance.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data?.eligible) {
		return (
			<Card className="border-orange-200/60 bg-orange-50/30 dark:border-orange-900/30 dark:bg-orange-950/10 h-full">
				<CardContent className="p-6 flex items-center gap-4 h-full">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
						<AlertCircle className="h-6 w-6 text-orange-500" />
					</div>
					<div>
						<p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
							Not yet eligible
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							Make your first donation to receive a Kinders NFT and unlock voting.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const tier = data.tier as NftTier
	const tierLabel = TIER_LABELS[tier]
	const voteWeight = TIER_VOTE_WEIGHTS[tier]
	const tierColor = TIER_COLORS[tier]

	return (
		<Card className="border-green-200/60 bg-green-50/30 dark:border-green-900/30 dark:bg-green-950/10 h-full">
			<CardContent className="p-6 flex items-center justify-between gap-4 h-full">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
						<CheckCircle2 className="h-6 w-6 text-green-600" />
					</div>
					<div>
						<p className="text-sm font-semibold text-green-700 dark:text-green-400">
							Eligible to vote
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							Your Kinders NFT grants governance rights.
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Badge className={`${tierColor} border`}>{tierLabel}</Badge>
					<div className="text-center">
						<p className="text-2xl font-bold leading-none tabular-nums">
							{voteWeight}
						</p>
						<p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
							weight
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
