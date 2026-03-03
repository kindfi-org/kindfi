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
			<Card className="border-border/60">
				<CardContent className="p-4 flex items-center gap-3">
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					<span className="text-sm text-muted-foreground">
						Checking eligibility…
					</span>
				</CardContent>
			</Card>
		)
	}

	if (!session?.user?.id) {
		return (
			<Card className="border-border/60">
				<CardContent className="p-4 flex items-center gap-3">
					<Shield className="h-5 w-5 text-muted-foreground" />
					<div>
						<p className="text-sm font-medium">Sign in to vote</p>
						<p className="text-xs text-muted-foreground">
							Connect your wallet and sign in to participate in governance.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data?.eligible) {
		return (
			<Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/40 dark:bg-orange-950/20">
				<CardContent className="p-4 flex items-start gap-3">
					<AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
					<div>
						<p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
							Not yet eligible
						</p>
						<p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">
							Make your first donation to receive a Kinders NFT and unlock
							governance voting.
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
		<Card className="border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20">
			<CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
					<div>
						<p className="text-sm font-semibold text-green-700 dark:text-green-400">
							Eligible to vote
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							Your Kinders NFT grants you governance rights.
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge className={`${tierColor} border`}>{tierLabel}</Badge>
					<div className="text-center">
						<p className="text-lg font-bold leading-none">{voteWeight}</p>
						<p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
							vote weight
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
