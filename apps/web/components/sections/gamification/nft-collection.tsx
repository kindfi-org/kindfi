'use client'

import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { StatBadge } from './nft-collection/helpers'
import { NftCollectionHero } from './nft-collection/nft-collection-hero'
import { NftExtraGrid } from './nft-collection/nft-extra-grid'
import { NftMetadataPanel } from './nft-collection/nft-metadata-panel'
import { NftTierRoadmap } from './nft-collection/nft-tier-roadmap'
import { useNftCollection } from './nft-collection/use-nft-collection'

export function NFTCollection() {
	const [showMetadata, setShowMetadata] = useState(false)
	const {
		session,
		smartAccountAddress,
		isLoading,
		dbNft,
		userStats,
		nfts,
		tier,
		nft,
		attrs,
		impactScore,
		donations,
		quests,
		streaks,
		referrals,
		govVotes,
		currentPts,
		nextTierPts,
		progressPct,
	} = useNftCollection()

	if (!smartAccountAddress && !session?.user?.id) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
				<p>Connect your wallet to view your NFT collection</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p>Loading your Kinder NFT...</p>
			</div>
		)
	}

	if (!dbNft && nfts.length === 0) {
		return (
			<div className="text-center py-12">
				<Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
				<h3 className="text-lg font-semibold mb-2">No Kinder NFT Yet</h3>
				<p className="text-muted-foreground mb-2">
					Make your first donation to receive a Bronze Kinder NFT!
				</p>
				<p className="text-xs text-muted-foreground">
					Your NFT evolves as you donate, complete quests, and refer friends.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<NftCollectionHero
				nft={nft}
				dbNft={dbNft}
				tier={tier}
				smartAccountAddress={smartAccountAddress}
				nextTierPts={nextTierPts}
				currentPts={currentPts}
				progressPct={progressPct}
				govVotes={govVotes}
			/>

			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<StatBadge label="Impact" value={impactScore || '0'} />
				<StatBadge label="Donations" value={donations || '0'} />
				<StatBadge label="Quests" value={quests || '0'} />
				<StatBadge label="Streak" value={streaks || '0'} />
				<StatBadge label="Referrals" value={referrals || '0'} />
			</div>

			<NftMetadataPanel
				showMetadata={showMetadata}
				onToggle={() => setShowMetadata(!showMetadata)}
				nft={nft}
				dbNft={dbNft}
				attrs={attrs}
				userStats={userStats}
				tier={tier}
				smartAccountAddress={smartAccountAddress}
				nftContractAddress={dbNft?.contract_address}
			/>

			<NftExtraGrid nfts={nfts} />
			<NftTierRoadmap tier={tier} />
		</div>
	)
}
