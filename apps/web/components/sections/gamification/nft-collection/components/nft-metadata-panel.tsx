'use client'

import { ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
import { getStellarExplorerAddressUrl } from '~/lib/utils/escrow/stellar-explorer'
import type { Tier } from '../constants'
import { TIERS } from '../constants'
import type { NFT, UserNFTRecord, UserStats } from '../types'
import { AttrChip } from '../utils/helpers'

interface NftMetadataPanelProps {
	nft: NFT | undefined
	dbNft: UserNFTRecord | null
	userStats: UserStats | undefined
	tier: Tier
	showMetadata: boolean
	onToggle: () => void
	smartAccountAddress: string | undefined
	nftContractAddress: string | undefined
}

export function NftMetadataPanel({
	nft,
	dbNft,
	userStats,
	tier,
	showMetadata,
	onToggle,
	smartAccountAddress,
	nftContractAddress,
}: NftMetadataPanelProps) {
	const tierConfig = TIERS[tier]
	const attrs = nft?.metadata?.attributes ?? []

	return (
		<Card>
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
			>
				<div className="flex items-center gap-2">
					<Info className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">NFT Metadata & Details</span>
				</div>
				{showMetadata ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				)}
			</button>
			{showMetadata && (
				<CardContent className="pt-0 pb-4 space-y-4">
					<div className="grid gap-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Token ID</span>
							<span className="font-mono">
								#{(nft?.tokenId ?? dbNft?.token_id ?? 0).toString().padStart(4, '0')}
							</span>
						</div>
						{nft?.metadata?.name && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Name</span>
								<span className="font-medium">{nft.metadata.name}</span>
							</div>
						)}
						{nft?.metadata?.description && (
							<div className="flex justify-between gap-4">
								<span className="text-muted-foreground shrink-0">Description</span>
								<span className="text-right">{nft.metadata.description}</span>
							</div>
						)}
						{nft?.metadata?.image_uri && (
							<div className="flex justify-between gap-2">
								<span className="text-muted-foreground shrink-0">Image URI</span>
								<a
									href={nft.metadata.image_uri}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline text-xs truncate max-w-[200px]"
								>
									{nft.metadata.image_uri}
								</a>
							</div>
						)}
						{nft?.metadata?.external_url && (
							<div className="flex justify-between gap-2">
								<span className="text-muted-foreground shrink-0">External URL</span>
								<a
									href={nft.metadata.external_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline text-xs truncate max-w-[200px]"
								>
									{nft.metadata.external_url}
								</a>
							</div>
						)}
					</div>
					{(attrs.length > 0 || userStats) && (
						<div>
							<p className="text-xs font-medium text-muted-foreground mb-2">Attributes</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
								{attrs.length > 0
									? attrs.map((a) => (
											<div key={a.trait_type} className="bg-muted/60 rounded px-2 py-1.5 text-xs">
												<span className="text-muted-foreground">{a.trait_type}:</span>{' '}
												<span className="font-medium">{a.value}</span>
											</div>
										))
									: userStats && (
											<>
												<AttrChip label="Impact Score" value={String(userStats.impactScore)} />
												<AttrChip label="Donations" value={String(userStats.donationCount)} />
												<AttrChip
													label="Quests Completed"
													value={String(userStats.questsCompleted)}
												/>
												<AttrChip label="Streak Days" value={String(userStats.streakDays)} />
												<AttrChip label="Referrals" value={String(userStats.referralCount)} />
												<AttrChip label="Tier" value={tierConfig.label} />
											</>
										)}
							</div>
						</div>
					)}
					<div className="flex flex-wrap gap-2 pt-2 border-t">
						{smartAccountAddress && (
							<a
								href={getStellarExplorerAddressUrl(smartAccountAddress)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								View holdings on Stellar Expert
							</a>
						)}
						{nftContractAddress && (
							<a
								href={getStellarExplorerAddressUrl(nftContractAddress)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								View NFT contract on Stellar Expert
							</a>
						)}
					</div>
				</CardContent>
			)}
		</Card>
	)
}
