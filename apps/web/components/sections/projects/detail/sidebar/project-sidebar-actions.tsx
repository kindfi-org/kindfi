'use client'

import { ExternalLink, Heart, Share } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

export function ProjectSidebarActions({
	project,
	isFollowing,
	onToggleFollow,
	onShare,
	isConnected,
	walletName,
	address,
	onConnect,
	onDisconnect,
}: {
	project: ProjectDetail
	isFollowing: boolean
	onToggleFollow: () => void
	onShare: () => void
	isConnected: boolean
	walletName?: string
	address?: string
	onConnect: () => void
	onDisconnect: () => void
}) {
	return (
		<>
			{project.escrowContractAddress && (
				<div className="p-3 my-4 text-sm bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
								Escrow Contract
							</p>
							<p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
								All funds are secured in an on-chain escrow contract. You can audit
								the contract on Stellar Explorer.
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="h-auto p-2 flex-shrink-0"
						>
							<Link
								href={getStellarExplorerUrl(project.escrowContractAddress)}
								target="_blank"
								rel="noopener noreferrer"
								title="View escrow contract on Stellar Explorer"
							>
								<ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
							</Link>
						</Button>
					</div>
				</div>
			)}

			<div className="flex gap-4">
				<Button
					variant="outline"
					className="flex gap-2 justify-center items-center w-full bg-white gradient-border-btn"
					onClick={onToggleFollow}
				>
					<Heart
						className={`h-4 w-4 ${isFollowing ? 'text-red-500 fill-red-500' : ''}`}
					/>
					{isFollowing ? 'Following' : 'Follow'}
				</Button>

				<Button
					variant="outline"
					className="flex gap-2 justify-center items-center w-full bg-white gradient-border-btn"
					onClick={onShare}
				>
					<Share className="w-4 h-4" />
					Share
				</Button>
			</div>

			<div className="p-3 mt-4 text-sm bg-white rounded-md border border-gray-200">
				<div className="flex justify-between items-center mb-2">
					<span className="font-medium">Donor details</span>
					<span className={isConnected ? 'text-green-600' : 'text-red-600'}>
						{isConnected ? 'Connected' : 'Not connected'}
					</span>
				</div>
				{isConnected ? (
					<div className="text-gray-700 break-all">
						<p className="mb-1">{walletName || 'Wallet'}</p>
						<p className="text-xs">{address}</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={onDisconnect}
						>
							Disconnect wallet
						</Button>
					</div>
				) : (
					<Button variant="outline" size="sm" onClick={onConnect}>
						Connect wallet
					</Button>
				)}
			</div>
		</>
	)
}
