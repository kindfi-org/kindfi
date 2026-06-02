import { ArrowUp, Diamond, ExternalLink, ImageIcon, Trophy } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '~/components/base/badge'
import { Card } from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import { getStellarExplorerAddressUrl } from '~/lib/utils/escrow/stellar-explorer'
import type { Tier } from '../constants'
import { TIERS } from '../constants'
import type { NFT, UserNFTRecord } from '../types'

interface NftHeroCardProps {
	nft: NFT | undefined
	dbNft: UserNFTRecord | null
	tier: Tier
	currentPts: number
	progressPct: number
	govVotes: string | undefined
	smartAccountAddress: string | undefined
}

export function NftHeroCard({
	nft,
	dbNft,
	tier,
	currentPts,
	progressPct,
	govVotes,
	smartAccountAddress,
}: NftHeroCardProps) {
	const tierConfig = TIERS[tier]
	const nextTierPts = tierConfig.nextPts

	return (
		<Card className="overflow-hidden">
			<div className="flex flex-col sm:flex-row">
				<div className="relative w-full sm:w-56 h-56 sm:h-auto bg-muted shrink-0">
					{nft?.metadata?.image_uri ? (
						<Image
							src={nft.metadata.image_uri}
							alt={nft.metadata.name}
							fill
							className="object-cover"
							unoptimized
						/>
					) : (
						<div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-secondary/10">
							<ImageIcon className="h-16 w-16 text-muted-foreground" />
						</div>
					)}
					{(nft || dbNft) && (
						<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
							#{(nft?.tokenId ?? dbNft?.token_id ?? 0).toString().padStart(4, '0')}
						</div>
					)}
				</div>

				<div className="flex-1 p-5 space-y-4">
					<div className="flex items-start justify-between gap-2">
						<div>
							<h3 className="text-xl font-bold">
								{nft?.metadata?.name ?? `${tierConfig.label} Kinder`}
							</h3>
							<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
								{nft?.metadata?.description ??
									'Your KindFi Kinder NFT represents your impact on the platform.'}
							</p>
						</div>
						<Badge className={`${tierConfig.color} border shrink-0`}>
							<Trophy className="h-3 w-3 mr-1" />
							{tierConfig.label}
						</Badge>
					</div>

					{nextTierPts ? (
						<div className="space-y-1.5">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>
									<ArrowUp className="inline h-3 w-3 mr-0.5" />
									Next tier at {nextTierPts} pts
								</span>
								<span>
									{currentPts} / {nextTierPts} pts
								</span>
							</div>
							<Progress value={progressPct} className="h-2" />
						</div>
					) : (
						<div className="flex items-center gap-2 text-sm text-cyan-700">
							<Diamond className="h-4 w-4" />
							<span className="font-medium">Maximum tier reached!</span>
						</div>
					)}

					<p className="text-xs text-muted-foreground">
						Governance votes:{' '}
						<span className="font-semibold text-foreground">{govVotes || tierConfig.votes}</span>
					</p>

					{smartAccountAddress && (
						<a
							href={getStellarExplorerAddressUrl(smartAccountAddress)}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
						>
							<ExternalLink className="h-3.5 w-3.5" />
							View on Stellar Expert
						</a>
					)}
				</div>
			</div>
		</Card>
	)
}
