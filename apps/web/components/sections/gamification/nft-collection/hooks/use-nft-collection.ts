'use client'

import { isValidStellarWalletAddress } from '@packages/lib/utils/wallet-address'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffectiveWalletAddress } from '~/hooks/wallet/use-effective-wallet-address'
import { resolveEffectiveGamificationAddress } from '~/lib/utils/wallet-address'
import type { NFTCollectionResponse, UserNFTRecord, UserStats } from '../types'

export function useNftCollection() {
	const { data: session } = useSession()
	const { address: effectiveAddress } = useEffectiveWalletAddress()

	const walletAddress = resolveEffectiveGamificationAddress({
		smartAccountAddress: session?.device?.address || session?.user?.device?.address,
		sessionWalletAddress: session?.wallet?.address ?? session?.user?.wallet?.address,
		kitWalletAddress: effectiveAddress,
	})

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

	const dbNft = userData?.nft ?? null

	const onChainAddress =
		dbNft?.stellar_address && isValidStellarWalletAddress(dbNft.stellar_address)
			? dbNft.stellar_address
			: walletAddress

	const tokenIdHint =
		dbNft && Number.isInteger(dbNft.token_id) && dbNft.token_id >= 0 ? dbNft.token_id : null

	const { data: onChainData, isLoading: chainLoading } = useQuery<NFTCollectionResponse>({
		queryKey: ['nfts', onChainAddress, tokenIdHint],
		queryFn: async () => {
			if (!onChainAddress) throw new Error('No wallet')
			const query =
				tokenIdHint !== null ? `?tokenId=${encodeURIComponent(String(tokenIdHint))}` : ''
			const res = await fetch(`/api/nfts/${onChainAddress}${query}`)
			if (!res.ok) throw new Error('Failed to fetch NFTs')
			return res.json()
		},
		enabled: !!onChainAddress,
	})

	return {
		session,
		smartAccountAddress: walletAddress,
		dbNft,
		userStats: userData?.stats,
		onChainData,
		isLoading: dbLoading || chainLoading,
	}
}
