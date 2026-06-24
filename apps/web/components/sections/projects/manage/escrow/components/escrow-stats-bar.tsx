'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { Copy, ExternalLink, Layers, RefreshCw, Wallet } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import { truncateAddress } from '~/lib/utils/escrow/milestone-utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

interface EscrowStatsBarProps {
	escrowContractAddress: string
	escrowType: EscrowType
	balance: number | null
	isLoadingBalance: boolean
	milestoneProgress: number
	approvedCount: number
	totalMilestones: number
	onRefresh: () => void
	isRefreshing?: boolean
}

export function EscrowStatsBar({
	escrowContractAddress,
	escrowType,
	balance,
	isLoadingBalance,
	milestoneProgress,
	approvedCount,
	totalMilestones,
	onRefresh,
	isRefreshing = false,
}: EscrowStatsBarProps) {
	const handleCopyContract = () => {
		void navigator.clipboard.writeText(escrowContractAddress)
		toast.success('Contract address copied')
	}

	const typeLabel = escrowType === 'single-release' ? 'Single Release' : 'Multi Release'

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Contract
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-2">
						<code className="font-mono text-xs break-all sm:text-sm">{escrowContractAddress}</code>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={handleCopyContract}
							aria-label="Copy contract address"
						>
							<Copy className="h-4 w-4" aria-hidden="true" />
						</Button>
						<Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
							<Link
								href={getStellarExplorerUrl(escrowContractAddress)}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="View contract on Stellar explorer"
							>
								<ExternalLink className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="secondary">{typeLabel}</Badge>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={isRefreshing}
					>
						<RefreshCw
							className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
							aria-hidden="true"
						/>
						Refresh
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center justify-between pt-6">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Balance</p>
							<p className="mt-1 text-2xl font-bold tabular-nums">
								{isLoadingBalance ? (
									<span className="text-muted-foreground">Loading…</span>
								) : balance !== null ? (
									`$${balance.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 7,
									})}`
								) : (
									<span className="text-muted-foreground">N/A</span>
								)}
							</p>
						</div>
						<Wallet className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<p className="text-sm font-medium text-muted-foreground">Milestone Progress</p>
						<p className="mt-1 text-2xl font-bold tabular-nums">{milestoneProgress}%</p>
						<p className="mt-1 text-xs text-muted-foreground">
							{approvedCount} of {totalMilestones} approved
						</p>
						<Progress value={milestoneProgress} className="mt-3 h-2" />
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center justify-between pt-6">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Escrow Type</p>
							<p className="mt-1 text-lg font-semibold">{typeLabel}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{escrowType === 'single-release'
									? 'One payout when all milestones are approved'
									: 'Separate payout per milestone'}
							</p>
						</div>
						<Layers className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
