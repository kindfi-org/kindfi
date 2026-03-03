'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Loader2, Vote } from 'lucide-react'
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
	const fundBalance = balanceData?.data?.xlm

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Vote className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-foreground">
						Community Governance
					</h2>
					<p className="text-sm text-muted-foreground">
						Vote on how the community fund is redistributed
					</p>
				</div>
			</div>

			{/* Community Fund Balance */}
			<FundBalanceWidget />

			{/* Eligibility */}
			<EligibilityBadge />

			{/* Rounds tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="active" className="gap-1.5">
						<span className="h-2 w-2 rounded-full bg-green-500" />
						Active Rounds
						{activeRounds.length > 0 && (
							<span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
								{activeRounds.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="past" className="gap-1.5">
						<History className="h-3.5 w-3.5" />
						Past Rounds
					</TabsTrigger>
				</TabsList>

				<AnimatePresence mode="wait">
					<TabsContent value="active" className="mt-4">
						<motion.div
							key="active"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.15 }}
						>
							{isLoading ? (
								<div className="flex items-center justify-center py-16">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
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

					<TabsContent value="past" className="mt-4">
						<motion.div
							key="past"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.15 }}
						>
							{isLoading ? (
								<div className="flex items-center justify-center py-16">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
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
		<div className="text-center py-16 space-y-3">
			<Icon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
			<p className="font-semibold text-foreground">{title}</p>
			<p className="text-sm text-muted-foreground max-w-xs mx-auto">
				{description}
			</p>
		</div>
	)
}
