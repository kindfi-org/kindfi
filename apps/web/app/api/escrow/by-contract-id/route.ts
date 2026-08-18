import { NextResponse } from 'next/server'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { getEscrowByContractIdFromIndexer } from '~/lib/services/escrow-indexer.service'

const publicReadLimiter = new RateLimiter({
	maxAttempts: 120,
	windowSecs: 60,
	blockSecs: 300,
	configId: 'escrow-by-contract-id',
})

const getClientIp = (request: Request): string =>
	request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

export async function GET(request: Request) {
	const contractId = new URL(request.url).searchParams.get('contractId')?.trim()

	if (!contractId) {
		return NextResponse.json({ error: 'contractId is required' }, { status: 400 })
	}

	const rateLimit = await publicReadLimiter.increment(getClientIp(request), 'escrow-by-contract-id')
	if (rateLimit.isBlocked) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': '300' } },
		)
	}

	const result = await getEscrowByContractIdFromIndexer(contractId, { validateOnChain: true })

	if (!result.ok) {
		return NextResponse.json({ error: result.error }, { status: 404 })
	}

	return NextResponse.json({
		escrow: result.escrow,
		apiVersion: result.apiVersion,
	})
}
