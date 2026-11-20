import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
	type ClientStellarNetworkId,
	getClientStellarNetworkId,
} from '~/lib/config/stellar-network.config'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import {
	type PulseQuoteResult,
	type PulseQuoteSuccess,
	type ReflectorQuotedAsset,
	readPulseQuote,
} from '~/lib/stellar/reflector-pulse.server'

export const PRICE_CACHE_TTL_MS = 60_000
export const PRICE_CDN_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=30'

const SUPPORTED_ASSETS: ReadonlySet<string> = new Set<ReflectorQuotedAsset>(['XLM', 'USDC'])

type CachedQuoteEntry = {
	readonly quote: PulseQuoteSuccess
	readonly expiresAtMs: number
}

const quoteCache = new Map<string, CachedQuoteEntry>()
const inFlightReads = new Map<string, Promise<PulseQuoteResult>>()

export function clearPriceQuoteCache(): void {
	quoteCache.clear()
	inFlightReads.clear()
}

function parseQuotedAsset(raw: string | null): ReflectorQuotedAsset | null {
	if (!raw) return null
	const normalized = raw.trim().toUpperCase()
	if (!SUPPORTED_ASSETS.has(normalized)) return null
	return normalized as ReflectorQuotedAsset
}

function getClientIp(req: NextRequest): string {
	return (
		req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		req.headers.get('x-real-ip')?.trim() ||
		'anonymous'
	)
}

export type PriceRouteDeps = {
	readQuote?: (params: {
		network: ClientStellarNetworkId
		asset: ReflectorQuotedAsset
	}) => Promise<PulseQuoteResult>
	getNetwork?: () => ClientStellarNetworkId
	nowMs?: () => number
}

export async function handleGetPrice(
	req: Pick<NextRequest, 'nextUrl'>,
	deps: PriceRouteDeps = {},
): Promise<NextResponse> {
	const asset = parseQuotedAsset(req.nextUrl.searchParams.get('asset'))
	if (!asset) {
		return NextResponse.json(
			{ error: 'Invalid asset. Expected XLM or USDC.' },
			{ status: 400, headers: { 'Cache-Control': 'no-store' } },
		)
	}

	const network = (deps.getNetwork ?? getClientStellarNetworkId)()
	const nowMs = (deps.nowMs ?? Date.now)()
	const cacheKey = `${network}:${asset}`

	const cached = quoteCache.get(cacheKey)
	if (cached && cached.expiresAtMs > nowMs) {
		return NextResponse.json(cached.quote, {
			status: 200,
			headers: { 'Cache-Control': PRICE_CDN_CACHE_CONTROL },
		})
	}

	const reader = deps.readQuote ?? readPulseQuote
	let pending = inFlightReads.get(cacheKey)
	if (!pending) {
		pending = reader({ network, asset }).finally(() => {
			inFlightReads.delete(cacheKey)
		})
		inFlightReads.set(cacheKey, pending)
	}

	let result: PulseQuoteResult
	try {
		result = await pending
	} catch {
		return NextResponse.json(
			{ status: 'unavailable' },
			{ status: 503, headers: { 'Cache-Control': 'no-store' } },
		)
	}

	if ('status' in result) {
		return NextResponse.json(
			{ status: 'unavailable' },
			{ status: 503, headers: { 'Cache-Control': 'no-store' } },
		)
	}

	quoteCache.set(cacheKey, {
		quote: result,
		expiresAtMs: nowMs + PRICE_CACHE_TTL_MS,
	})

	return NextResponse.json(result, {
		status: 200,
		headers: { 'Cache-Control': PRICE_CDN_CACHE_CONTROL },
	})
}

export const GET = withRateLimit(
	{
		preset: 'lenient',
		identifier: getClientIp,
	},
	(req) => handleGetPrice(req),
)
