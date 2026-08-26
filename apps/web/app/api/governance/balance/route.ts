import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import {
	getTrustlessWorkApiBaseUrl,
	getTrustlessWorkApiKey,
} from '~/lib/config/trustless-work.config'

const COMMUNITY_FUND_ADDRESS = process.env.NEXT_PUBLIC_COMMUNITY_FUND_ADDRESS ?? ''

/** Shape returned by GET /helper/get-multiple-escrow-balance */
interface EscrowBalanceItem {
	address: string
	balance: number
}

/**
 * GET /api/governance/balance
 *
 * Fetches the balance of the community fund escrow contract via the
 * Trustless Work API (`GET /helper/get-multiple-escrow-balance`).
 */
export async function GET() {
	try {
		if (!COMMUNITY_FUND_ADDRESS) {
			return NextResponse.json({ error: 'Community fund address not configured' }, { status: 503 })
		}

		if (!getTrustlessWorkApiKey()) {
			return NextResponse.json({ error: 'Trustless Work API key not configured' }, { status: 503 })
		}

		const url = new URL(`${getTrustlessWorkApiBaseUrl()}/helper/get-multiple-escrow-balance`)
		url.searchParams.append('addresses[]', COMMUNITY_FUND_ADDRESS)

		const res = await fetch(url.toString(), {
			headers: { 'x-api-key': getTrustlessWorkApiKey() },
			next: { revalidate: 60 },
		})

		if (!res.ok) {
			const body = await res.text()
			logger.error('TW balance API error:', res.status, body)
			throw new Error(`Trustless Work API returned ${res.status}`)
		}

		const items: EscrowBalanceItem[] = await res.json()
		const balance = items.find((i) => i.address === COMMUNITY_FUND_ADDRESS)?.balance ?? 0

		return NextResponse.json({
			success: true,
			data: {
				address: COMMUNITY_FUND_ADDRESS,
				balance,
			},
		})
	} catch (error) {
		logger.error('Error fetching community fund balance:', error)
		return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
	}
}
