import { logger } from '@/lib/logger'

interface EscrowBalanceItem {
	address: string
	balance: number
}

const TW_API_KEY =
	process.env.TRUSTLESS_WORK_API_KEY ?? process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY ?? ''

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? 'development'

const TW_BASE_URL =
	process.env.TRUSTLESS_WORK_API_URL ??
	(APP_ENV === 'production' ? 'https://api.trustlesswork.com' : 'https://dev.api.trustlesswork.com')

export async function getEscrowBalance(contractAddress: string): Promise<number | null> {
	if (!contractAddress || !TW_API_KEY) {
		return null
	}

	try {
		const url = new URL(`${TW_BASE_URL}/helper/get-multiple-escrow-balance`)
		url.searchParams.append('addresses[]', contractAddress)

		const res = await fetch(url.toString(), {
			headers: { 'x-api-key': TW_API_KEY },
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
