'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { ExternalLink, Info, Loader2, Wallet, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'
import { EscrowDetailsCard } from './components/escrow-details-card'
import { MilestonesOverviewCard } from './components/milestones-overview-card'
import { RolesCard } from './components/roles-card'
import { TrustlineAndFundsCard } from './components/trustline-and-funds-card'
import { FundEscrowTab } from './tabs/fund-escrow-tab'
import { MilestonesTab } from './tabs/milestones-tab'
import { ReleaseTab } from './tabs/release-tab'

export function EscrowManagementPanel({
	projectId,
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

	const [activeTab, setActiveTab] = useState('overview')

	const milestones = escrowData?.milestones || []
	const effectiveEscrowType = escrowType || escrowData?.type || 'multi-release'

	const handleRefetch = () => {
		refetch()
		refetchBalance()
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Escrow Management</h1>
					<p className="mt-2 text-muted-foreground">
						Manage funds, milestones, and releases for your escrow contract
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" asChild className="gap-2">
						<Link
							href={getStellarExplorerUrl(escrowContractAddress)}
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="w-4 h-4" />
							View on Explorer
						</Link>
					</Button>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="sm" disabled={isLoadingEscrow}>
									<Info className="w-4 h-4 mr-2" />
									Contract Info
								</Button>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<div className="space-y-1">
									<p className="font-medium">Contract Address</p>
									<p className="font-mono text-xs break-all">
										{escrowContractAddress}
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Balance
								</p>
								<div className="text-2xl font-bold mt-1">
									{isLoadingBalance ? (
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									) : balance !== null ? (
										`$${balance.toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 7,
										})}`
									) : (
										<span className="text-muted-foreground">N/A</span>
									)}
								</div>
							</div>
							<Wallet className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Type
								</p>
								<p className="text-2xl font-bold mt-1">
									{effectiveEscrowType.replace('-', ' ')}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Milestones
								</p>
								<p className="text-2xl font-bold mt-1">{milestones.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6"
			>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="fund">Fund</TabsTrigger>
					<TabsTrigger value="milestones">Milestones</TabsTrigger>
					<TabsTrigger value="release">Release</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					{isLoadingEscrow ? (
						<Card>
							<CardContent className="py-12">
								<div className="flex flex-col items-center justify-center space-y-4">
									<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										Loading escrow data...
									</p>
								</div>
							</CardContent>
						</Card>
					) : error ? (
						<Card>
							<CardContent className="py-12">
								<div className="flex flex-col items-center justify-center space-y-4">
									<XCircle className="h-8 w-8 text-destructive" />
									<p className="text-sm text-muted-foreground">{error}</p>
									<Button onClick={handleRefetch} variant="outline">
										Retry
									</Button>
								</div>
							</CardContent>
						</Card>
					) : escrowData ? (
						<>
							<EscrowDetailsCard
								escrowData={escrowData}
								escrowContractAddress={escrowContractAddress}
							/>
							<RolesCard escrowData={escrowData} />
							<TrustlineAndFundsCard escrowData={escrowData} />
							{milestones.length > 0 && (
								<MilestonesOverviewCard milestones={milestones} />
							)}
						</>
					) : (
						<Card>
							<CardContent className="py-12">
								<div className="flex flex-col items-center justify-center space-y-4">
									<XCircle className="h-8 w-8 text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										No escrow data found
									</p>
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Fund Tab */}
				<TabsContent value="fund" className="space-y-6">
					<FundEscrowTab
						escrowContractAddress={escrowContractAddress}
						escrowType={effectiveEscrowType}
						balance={balance}
						isLoadingBalance={isLoadingBalance}
						onSuccess={handleRefetch}
					/>
				</TabsContent>

				{/* Milestones Tab */}
				<TabsContent value="milestones" className="space-y-6">
					<MilestonesTab
						escrowContractAddress={escrowContractAddress}
						escrowType={effectiveEscrowType}
						milestones={milestones}
						isLoading={isLoadingEscrow}
						onSuccess={handleRefetch}
					/>
				</TabsContent>

				{/* Release Tab */}
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
