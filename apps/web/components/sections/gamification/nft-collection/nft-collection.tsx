'use client'

import { useState } from 'react'
import { NftAdditionalList } from './components/nft-additional-list'
import { NftEmpty, NftLoading, NftNotConnected } from './components/nft-empty-states'
import { NftHeroCard } from './components/nft-hero-card'
import { NftMetadataPanel } from './components/nft-metadata-panel'
import { NftStatsGrid } from './components/nft-stats-grid'
import { TierRoadmap } from './components/tier-roadmap'
import type { Tier } from './constants'
import { TIERS } from './constants'
import { useNftCollection } from './hooks/use-nft-collection'
import { findAttr } from './utils/helpers'

export function NFTCollection() {
	const [showMetadata, setShowMetadata] = useState(false)
	const {
		session,
		smartAccountAddress,
		dbNft,
		userStats,
		onChainData,
		isLoading,
	} = useNftCollection()

	if (!smartAccountAddress && !session?.user?.id) {
		return <NftNotConnected />
	}

	if (isLoading) {
		return <NftLoading />
	}

	const nfts = onChainData?.data?.nfts ?? []
	const tier: Tier = (dbNft?.tier as Tier) ?? 'bronze'
	const tierConfig = TIERS[tier]

	if (!dbNft && nfts.length === 0) {
		return <NftEmpty />
	}

	const nft = nfts[0]
	const attrs = nft?.metadata?.attributes ?? []
	const impactScoreOnChain = findAttr(attrs, 'Impact Score')
	const donationsOnChain = findAttr(attrs, 'Total Donations')
	const questsOnChain = findAttr(attrs, 'Quests Completed')
	const streaksOnChain = findAttr(attrs, 'Streak Days')
	const referralsOnChain = findAttr(attrs, 'Referrals')
	const govVotes = findAttr(attrs, 'Governance Votes')

	const impactScore = impactScoreOnChain ?? String(userStats?.impactScore ?? 0)
	const donations = donationsOnChain ?? String(userStats?.totalDonations ?? 0)
	const quests = questsOnChain ?? String(userStats?.questsCompleted ?? 0)
	const streaks = streaksOnChain ?? String(userStats?.streakDays ?? 0)
	const referrals = referralsOnChain ?? String(userStats?.referralCount ?? 0)
	const currentPts = Number(impactScore) || userStats?.impactScore || 0
	const nextTierPts = tierConfig.nextPts
	const progressPct = nextTierPts
		? Math.min(
				100,
				Math.round(
					((currentPts - tierConfig.minPts) /
						(nextTierPts - tierConfig.minPts)) *
						100,
				),
			)
		: 100

	return (
		<div className="space-y-6">
			<NftHeroCard
				nft={nft}
				dbNft={dbNft}
				tier={tier}
				currentPts={currentPts}
				progressPct={progressPct}
				govVotes={govVotes}
				smartAccountAddress={smartAccountAddress}
			/>

			<NftStatsGrid
				impactScore={impactScore}
				donations={donations}
				quests={quests}
				streaks={streaks}
				referrals={referrals}
			/>

			<NftMetadataPanel
				nft={nft}
				dbNft={dbNft}
				userStats={userStats}
				tier={tier}
				showMetadata={showMetadata}
				onToggle={() => setShowMetadata(!showMetadata)}
				smartAccountAddress={smartAccountAddress}
				nftContractAddress={dbNft?.contract_address}
			/>

			<NftAdditionalList nfts={nfts} />

			<TierRoadmap tier={tier} />
		</div>
	)
}
