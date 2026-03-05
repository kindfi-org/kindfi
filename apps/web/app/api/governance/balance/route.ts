import { NextResponse } from 'next/server'

const TW_API_KEY = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY ?? ''
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? 'development'
const TW_BASE_URL =
	APP_ENV === 'production'
		? 'https://api.trustlesswork.com'
		: 'https://dev.api.trustlesswork.com'

const COMMUNITY_FUND_ADDRESS =
	process.env.NEXT_PUBLIC_COMMUNITY_FUND_ADDRESS ?? ''

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
			return NextResponse.json(
				{ error: 'Community fund address not configured' },
				{ status: 503 },
			)
		}

		if (!TW_API_KEY) {
			return NextResponse.json(
				{ error: 'Trustless Work API key not configured' },
				{ status: 503 },
			)
		}

		const url = new URL(`${TW_BASE_URL}/helper/get-multiple-escrow-balance`)
		url.searchParams.append('addresses[]', COMMUNITY_FUND_ADDRESS)

		const res = await fetch(url.toString(), {
			headers: { 'x-api-key': TW_API_KEY },
			next: { revalidate: 60 },
		})

		if (!res.ok) {
			const body = await res.text()
			console.error('TW balance API error:', res.status, body)
			throw new Error(`Trustless Work API returned ${res.status}`)
		}

		const items: EscrowBalanceItem[] = await res.json()
		const balance =
			items.find((i) => i.address === COMMUNITY_FUND_ADDRESS)?.balance ?? 0

		return NextResponse.json({
			success: true,
			data: {
				address: COMMUNITY_FUND_ADDRESS,
				balance,
			},
		})
	} catch (error) {
		console.error('Error fetching community fund balance:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch balance' },
			{ status: 500 },
		)
	}
}
