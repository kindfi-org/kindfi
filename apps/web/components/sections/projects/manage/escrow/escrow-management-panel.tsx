'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { CheckCircle2, DollarSign, LayoutDashboard, Loader2, Send, XCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { EscrowDetailsCard } from './components/escrow-details-card'
import { EscrowStatsBar } from './components/escrow-stats-bar'
import { EscrowWorkflowGuide } from './components/escrow-workflow-guide'
import { MilestonesOverviewCard } from './components/milestones-overview-card'
import { RolesCard } from './components/roles-card'
import { TrustlessExternalWalletBanner } from './components/trustless-external-wallet-banner'
import { TrustlineAndFundsCard } from './components/trustline-and-funds-card'
import {
	type EscrowManagementTab,
	useEscrowWorkflowStatus,
} from './hooks/use-escrow-workflow-status'
import { FundEscrowTab } from './tabs/fund-escrow-tab'
import { MilestonesTab } from './tabs/milestones-tab'
import { ReleaseTab } from './tabs/release-tab'

const TAB_ITEMS: { value: EscrowManagementTab; label: string; icon: typeof LayoutDashboard }[] = [
	{ value: 'overview', label: 'Overview', icon: LayoutDashboard },
	{ value: 'fund', label: 'Fund', icon: DollarSign },
	{ value: 'milestones', label: 'Milestones', icon: CheckCircle2 },
	{ value: 'release', label: 'Release', icon: Send },
]

export function EscrowManagementPanel({
	projectId: _projectId,
	escrowContractAddress,
	escrowType,
}: {
	projectId: string
	escrowContractAddress: string
	escrowType?: EscrowType
}) {
	const {
		escrowData,
		isLoading: isLoadingEscrow,
		error,
		refetch,
	} = useEscrowData({
		escrowContractAddress,
		escrowType,
	})
	const {
		balance,
		isLoading: isLoadingBalance,
		refetch: refetchBalance,
	} = useEscrowBalance({
		escrowContractAddress,
		escrowType,
	})

	const [activeTab, setActiveTab] = useState<EscrowManagementTab>('overview')
	const [isRefreshing, setIsRefreshing] = useState(false)

	const milestones = escrowData?.milestones || []
	const effectiveEscrowType = escrowType || escrowData?.type || 'multi-release'

	const workflow = useEscrowWorkflowStatus({
		balance,
		milestones,
		escrowType: effectiveEscrowType,
		escrowData,
	})

	const handleRefetch = useCallback(async () => {
		setIsRefreshing(true)
		try {
			await Promise.all([refetch(), refetchBalance()])
		} finally {
			setIsRefreshing(false)
		}
	}, [refetch, refetchBalance])

	const handleGoToTab = useCallback((tab: EscrowManagementTab) => {
		setActiveTab(tab)
	}, [])

	return (
		<div className="space-y-6">
			<TrustlessExternalWalletBanner />

			<EscrowStatsBar
				escrowContractAddress={escrowContractAddress}
				escrowType={effectiveEscrowType}
				balance={balance}
				isLoadingBalance={isLoadingBalance}
				milestoneProgress={workflow.progress}
				approvedCount={workflow.approvedCount}
				totalMilestones={workflow.totalMilestones}
				onRefresh={handleRefetch}
				isRefreshing={isRefreshing || isLoadingEscrow || isLoadingBalance}
			/>

			<EscrowWorkflowGuide
				headline={workflow.headline}
				detail={workflow.detail}
				recommendedTab={workflow.recommendedTab}
				steps={workflow.steps}
				onGoToTab={handleGoToTab}
			/>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as EscrowManagementTab)}
				className="space-y-6"
			>
				<TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
					{TAB_ITEMS.map(({ value, label, icon: Icon }) => (
						<TabsTrigger
							key={value}
							value={value}
							className="flex items-center gap-2 py-2.5 data-[state=active]:shadow-sm"
						>
							<Icon className="h-4 w-4" aria-hidden="true" />
							<span>{label}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					{isLoadingEscrow ? (
						<LoadingState message="Loading escrow data…" />
					) : error ? (
						<ErrorState message={error} onRetry={handleRefetch} />
					) : escrowData ? (
						<>
							<EscrowDetailsCard
								escrowData={escrowData}
								escrowContractAddress={escrowContractAddress}
							/>
							{milestones.length > 0 ? <MilestonesOverviewCard milestones={milestones} /> : null}
							<RolesCard escrowData={escrowData} />
							<TrustlineAndFundsCard escrowData={escrowData} />
						</>
					) : (
						<ErrorState message="No escrow data found for this contract." onRetry={handleRefetch} />
					)}
				</TabsContent>

				<TabsContent value="fund" className="space-y-6">
					<FundEscrowTab
						escrowContractAddress={escrowContractAddress}
						escrowType={effectiveEscrowType}
						balance={balance}
						isLoadingBalance={isLoadingBalance}
						onSuccess={handleRefetch}
					/>
				</TabsContent>

				<TabsContent value="milestones" className="space-y-6">
					<MilestonesTab
						escrowContractAddress={escrowContractAddress}
						escrowType={effectiveEscrowType}
						milestones={milestones}
						isLoading={isLoadingEscrow}
						onSuccess={handleRefetch}
						onGoToRelease={() => setActiveTab('release')}
					/>
				</TabsContent>

				<TabsContent value="release" className="space-y-6">
					<ReleaseTab
						escrowContractAddress={escrowContractAddress}
						escrowType={effectiveEscrowType}
						milestones={milestones}
						onSuccess={handleRefetch}
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}

function LoadingState({ message }: { message: string }) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
				<p className="text-sm text-muted-foreground" aria-live="polite">
					{message}
				</p>
			</CardContent>
		</Card>
	)
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
				<XCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
				<p className="max-w-md text-center text-sm text-muted-foreground">{message}</p>
				<Button type="button" variant="outline" onClick={onRetry}>
					Retry
				</Button>
			</CardContent>
		</Card>
	)
}
