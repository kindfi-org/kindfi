import { logger } from '@/lib/logger'
import {
	getTrustlessWorkApiBaseUrl,
	getTrustlessWorkApiKey,
} from '~/lib/config/trustless-work.config'

interface EscrowBalanceItem {
	address: string
	balance: number
}

export async function getEscrowBalance(contractAddress: string): Promise<number | null> {
	if (!contractAddress) {
		return null
	}

	const apiKey = getTrustlessWorkApiKey()
	if (!apiKey) {
		return null
	}

	try {
		const url = new URL(`${getTrustlessWorkApiBaseUrl()}/helper/get-multiple-escrow-balance`)
		url.searchParams.append('addresses[]', contractAddress)

		const res = await fetch(url.toString(), {
			headers: { 'x-api-key': apiKey },
			cache: 'no-store',
		})

		if (!res.ok) {
			const body = await res.text()
			logger.error('Trustless Work balance API error:', res.status, body)
			return null
		}

		const items: EscrowBalanceItem[] = await res.json()
		return items.find((item) => item.address === contractAddress)?.balance ?? null
	} catch (error) {
		logger.error('Failed to fetch escrow balance:', error)
		return null
	}
}
