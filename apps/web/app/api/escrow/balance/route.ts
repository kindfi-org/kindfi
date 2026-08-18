import { NextResponse } from 'next/server'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { getEscrowBalance } from '~/lib/services/escrow-balance.service'

const publicReadLimiter = new RateLimiter({
	maxAttempts: 120,
	windowSecs: 60,
	blockSecs: 300,
	configId: 'escrow-balance',
})

const getClientIp = (request: Request): string =>
	request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

export async function GET(request: Request) {
	const contractId = new URL(request.url).searchParams.get('contractId')?.trim()

	if (!contractId) {
		return NextResponse.json({ error: 'contractId is required' }, { status: 400 })
	}

	const rateLimit = await publicReadLimiter.increment(getClientIp(request), 'escrow-balance')
	if (rateLimit.isBlocked) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': '300' } },
		)
	}

	const balance = await getEscrowBalance(contractId)

	return NextResponse.json({ balance })
}
