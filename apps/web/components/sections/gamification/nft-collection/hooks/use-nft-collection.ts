'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { resolveSmartAccountAddress } from '~/lib/utils/wallet-address'
import type { NFTCollectionResponse, UserNFTRecord, UserStats } from '../types'

export function useNftCollection() {
	const { data: session } = useSession()
	const smartAccountAddress = resolveSmartAccountAddress(
		session?.device?.address || session?.user?.device?.address,
	)

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
					donationCount: 0,
					totalAmount: 0,
					questsCompleted: 0,
					streakDays: 0,
					referralCount: 0,
				},
			}
		},
		enabled: !!session?.user?.id,
	})

	const { data: onChainData, isLoading: chainLoading } = useQuery<NFTCollectionResponse>({
		queryKey: ['nfts', smartAccountAddress],
		queryFn: async () => {
			if (!smartAccountAddress) throw new Error('No wallet')
			const res = await fetch(`/api/nfts/${smartAccountAddress}`)
			if (!res.ok) throw new Error('Failed to fetch NFTs')
			return res.json()
		},
		enabled: !!smartAccountAddress,
	})

	return {
		session,
		smartAccountAddress,
		dbNft: userData?.nft ?? null,
		userStats: userData?.stats,
		onChainData,
		isLoading: dbLoading || chainLoading,
	}
}
