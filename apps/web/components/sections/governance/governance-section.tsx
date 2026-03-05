'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Globe,
	History,
	ShieldCheck,
	Sparkles,
	Vote,
} from 'lucide-react'
import { useState } from 'react'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import type {
	CommunityFundBalance,
	GovernanceRound,
} from '~/lib/governance/types'
import { CommunityFundBalance as FundBalanceWidget } from './community-fund-balance'
import { EligibilityBadge } from './eligibility-badge'
import { GovernanceRoundCard } from './governance-round-card'

interface RoundsResponse {
	success: boolean
	data: GovernanceRound[]
}

interface BalanceResponse {
	success: boolean
	data: CommunityFundBalance
}

export function GovernanceSection() {
	const [activeTab, setActiveTab] = useState('active')

	const { data: balanceData } = useQuery<BalanceResponse>({
		queryKey: ['community-fund-balance'],
		queryFn: async () => {
			const res = await fetch('/api/governance/balance')
			if (!res.ok) throw new Error('Failed')
			return res.json()
		},
		staleTime: 30_000,
	})

	const { data: allRoundsData, isLoading } = useQuery<RoundsResponse>({
		queryKey: ['governance-rounds'],
		queryFn: async () => {
			const res = await fetch('/api/governance/rounds')
			if (!res.ok) throw new Error('Failed to fetch rounds')
			return res.json()
		},
		refetchInterval: 60_000,
	})

	const allRounds = allRoundsData?.data ?? []
	const activeRounds = allRounds.filter(
		(r) => r.status === 'active' || r.status === 'upcoming',
	)
	const pastRounds = allRounds.filter((r) => r.status === 'ended')
	const fundBalance = balanceData?.data?.balance

	return (
		<div className="space-y-8">
			{/* Hero */}
			<div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-8">
				<div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent)]" />
				<div className="relative space-y-4">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						<Sparkles className="h-3 w-3" />
						Community-driven allocation
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight">
						Community Governance
					</h1>
					<p className="max-w-lg text-muted-foreground leading-relaxed">
						Shape the impact of the KindFi community fund. Your Kinders NFT
						gives you voting power — higher tiers carry more weight.
					</p>
					<div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
						<span className="flex items-center gap-1.5">
							<ShieldCheck className="h-4 w-4 text-green-500" />
							On-chain verified
						</span>
						<span className="flex items-center gap-1.5">
							<Globe className="h-4 w-4 text-blue-500" />
							Transparent results
						</span>
					</div>
				</div>
			</div>

			{/* Fund balance + Eligibility side by side on desktop */}
			<div className="grid gap-4 md:grid-cols-2">
				<FundBalanceWidget />
				<EligibilityBadge />
			</div>

			{/* Rounds tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-11">
					<TabsTrigger value="active" className="gap-2 text-sm">
						<Vote className="h-4 w-4" />
						Active Rounds
						{activeRounds.length > 0 && (
							<span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground font-bold">
								{activeRounds.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="past" className="gap-2 text-sm">
						<History className="h-4 w-4" />
						Past Rounds
						{pastRounds.length > 0 && (
							<span className="ml-0.5 text-muted-foreground text-xs">
								({pastRounds.length})
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<AnimatePresence mode="wait">
					<TabsContent value="active" className="mt-6">
						<motion.div
							key="active"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							{isLoading ? (
								<LoadingSkeleton />
							) : activeRounds.length === 0 ? (
								<EmptyState
									icon={Vote}
									title="No active rounds"
									description="Check back later — the next governance round will appear here when it opens."
								/>
							) : (
								<div className="space-y-8">
									{activeRounds.map((round) => (
										<GovernanceRoundCard
											key={round.id}
											roundId={round.id}
											fundBalance={fundBalance}
										/>
									))}
								</div>
							)}
						</motion.div>
					</TabsContent>

					<TabsContent value="past" className="mt-6">
						<motion.div
							key="past"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							{isLoading ? (
								<LoadingSkeleton />
							) : pastRounds.length === 0 ? (
								<EmptyState
									icon={History}
									title="No past rounds yet"
									description="Completed governance rounds will appear here with their results."
								/>
							) : (
								<div className="space-y-8">
									{pastRounds.map((round) => (
										<GovernanceRoundCard
											key={round.id}
											roundId={round.id}
											fundBalance={fundBalance}
										/>
									))}
								</div>
							)}
						</motion.div>
					</TabsContent>
				</AnimatePresence>
			</Tabs>
		</div>
	)
}

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2].map((i) => (
				<div
					key={i}
					className="h-40 animate-pulse rounded-xl border bg-muted/30"
				/>
			))}
		</div>
	)
}

function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ComponentType<{ className?: string }>
	title: string
	description: string
}) {
	return (
		<div className="text-center py-20 space-y-4 border rounded-xl bg-muted/10">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
				<Icon className="h-8 w-8 text-muted-foreground/50" />
			</div>
			<div className="space-y-1">
				<p className="font-semibold text-foreground">{title}</p>
				<p className="text-sm text-muted-foreground max-w-xs mx-auto">
					{description}
				</p>
			</div>
		</div>
	)
}
