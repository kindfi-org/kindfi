'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { TIERS, type Tier } from './tier-config'
import { findAttr } from './helpers'
import type {
	NFT,
	NFTCollectionResponse,
	UserNFTRecord,
	UserStats,
} from './types'

export function useNftCollection() {
	const { data: session } = useSession()
	const smartAccountAddress =
		session?.device?.address || session?.user?.device?.address

	const { data: userData, isLoading: dbLoading } = useQuery<{
		nft: UserNFTRecord | null
		stats: UserStats
	}>({
		queryKey: ['user-nft-db', session?.user?.id],
		queryFn: async () => {
			const res = await fetch('/api/nfts/user')
			if (!res.ok) throw new Error('Failed to fetch')
			const json = await res.json()
			return {
				nft: json.nft ?? null,
				stats: json.stats ?? {
					impactScore: 0,
					totalDonations: 0,
					questsCompleted: 0,
					streakDays: 0,
					referralCount: 0,
				},
			}
		},
		enabled: !!session?.user?.id,
	})

	const { data: onChainData, isLoading: chainLoading } =
		useQuery<NFTCollectionResponse>({
			queryKey: ['nfts', smartAccountAddress],
			queryFn: async () => {
				if (!smartAccountAddress) throw new Error('No wallet')
				const res = await fetch(`/api/nfts/${smartAccountAddress}`)
				if (!res.ok) throw new Error('Failed to fetch NFTs')
				return res.json()
			},
			enabled: !!smartAccountAddress,
		})

	const dbNft = userData?.nft ?? null
	const userStats = userData?.stats
	const nfts = onChainData?.data?.nfts ?? []
	const tier: Tier = (dbNft?.tier as Tier) ?? 'bronze'
	const tierConfig = TIERS[tier]
	const isLoading = dbLoading || chainLoading

	const nft: NFT | undefined = nfts[0]
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
					((currentPts - tierConfig.minPts) / (nextTierPts - tierConfig.minPts)) *
						100,
				),
			)
		: 100

	return {
		session,
		smartAccountAddress,
		isLoading,
		dbNft,
		userStats,
		nfts,
		tier,
		tierConfig,
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
	}
}
