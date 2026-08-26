'use client'

import { useQuery } from '@tanstack/react-query'
import type { EtherfuseRampAsset } from '~/lib/etherfuse/types'

const fetchEtherfuseRampAssets = async (
	currency: string,
	walletAddress: string,
): Promise<EtherfuseRampAsset[]> => {
	const params = new URLSearchParams({
		currency,
		wallet: walletAddress,
	})
	const response = await fetch(`/api/etherfuse/assets?${params.toString()}`)

	if (!response.ok) {
		const data = await response.json().catch(() => ({}))
		throw new Error(data.error ?? 'Failed to load ramp assets')
	}

	const data = (await response.json()) as { assets: EtherfuseRampAsset[] }
	return data.assets ?? []
}

export const useEtherfuseRampAssets = (currency: string, walletAddress: string) =>
	useQuery({
		queryKey: ['etherfuse-ramp-assets', currency.toLowerCase(), walletAddress],
		queryFn: () => fetchEtherfuseRampAssets(currency, walletAddress),
		enabled: Boolean(walletAddress),
		staleTime: 5 * 60 * 1000,
	})
