import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getClientStellarNetworkId } from '~/lib/config/stellar-network.config'
import type {
	PulseQuoteAsset,
	PulseQuoteNetwork,
	PulseQuoteResult,
	PulseQuoteSuccess,
	ReadPulseQuoteFn,
} from '~/lib/stellar/reflector-pulse'

export const PRICE_CACHE_TTL_SECONDS = 60
export const PRICE_CACHE_TTL_MS = PRICE_CACHE_TTL_SECONDS * 1000
export const PRICE_CACHE_CONTROL_HEADER = `public, max-age=${PRICE_CACHE_TTL_SECONDS}, s-maxage=${PRICE_CACHE_TTL_SECONDS}`

const ALLOWED_ASSETS = new Set<PulseQuoteAsset>(['XLM', 'USDC'])

interface CachedQuoteEntry {
	quote: PulseQuoteSuccess
	expiresAt: number
}

export interface CreatePricesGetHandlerOptions {
	readQuote: ReadPulseQuoteFn
	getNetwork?: () => PulseQuoteNetwork
	now?: () => number
	cacheTtlMs?: number
}

/**
 * Resolves the active Stellar network strictly from server environment config.
 * Never trusts network or contract parameters from incoming requests.
 */
export function resolveServerStellarNetwork(): PulseQuoteNetwork {
	const explicit = process.env.STELLAR_NETWORK?.trim().toLowerCase()

	if (explicit === 'mainnet' || explicit === 'public') {
		return 'mainnet'
	}

	if (explicit === 'testnet') {
		return 'testnet'
	}

	return getClientStellarNetworkId()
}

/**
 * Extracts the client IP for per-IP rate limiting on public GET routes.
 */
export function getPricesClientIp(req: NextRequest): string {
	const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
	if (forwarded) return forwarded

	const realIp = req.headers.get('x-real-ip')?.trim()
	if (realIp) return realIp

	return 'anonymous'
}

function isSupportedAsset(value: string | null): value is PulseQuoteAsset {
	return value !== null && ALLOWED_ASSETS.has(value as PulseQuoteAsset)
}

function isValidPulseQuote(result: PulseQuoteResult): result is PulseQuoteSuccess {
	if (!result || typeof result !== 'object' || 'status' in result) {
		return false
	}

	return (
		typeof result.price === 'number' &&
		Number.isFinite(result.price) &&
		result.price > 0 &&
		typeof result.decimals === 'number' &&
		Number.isInteger(result.decimals) &&
		result.decimals >= 0 &&
		typeof result.timestamp === 'number' &&
		Number.isFinite(result.timestamp) &&
		result.timestamp > 0 &&
		typeof result.source === 'string' &&
		result.source.length > 0 &&
		typeof result.feedContractId === 'string' &&
		result.feedContractId.length > 0
	)
}

/**
 * Builds the GET /api/prices handler with:
 * - Strict query param allowlist (`asset=XLM|USDC` only — no contractId proxy)
 * - Server-env network resolution
 * - 60-second in-memory cache + in-flight request coalescing (matches apps/web Map cache pattern)
 * - Fail-closed 503 `{ status: 'unavailable' }` on missing, stale, invalid, or failed reads
 */
export function createPricesGetHandler(options: CreatePricesGetHandlerOptions) {
	const {
		readQuote,
		getNetwork = resolveServerStellarNetwork,
		now = Date.now,
		cacheTtlMs = PRICE_CACHE_TTL_MS,
	} = options

	const cache = new Map<string, CachedQuoteEntry>()
	const inFlight = new Map<string, Promise<PulseQuoteSuccess | null>>()

	async function fetchQuoteCoalesced(
		cacheKey: string,
		network: PulseQuoteNetwork,
		asset: PulseQuoteAsset,
	): Promise<PulseQuoteSuccess | null> {
		const pending = inFlight.get(cacheKey)
		if (pending) {
			return pending
		}

		// Defer reader invocation via Promise.resolve().then(...) so `inFlight.set`
		// completes before `readQuote` runs, and update `cache` before `.finally()`
		// deletes `inFlight` so there is no gap between in-flight completion and cache fill.
		const promise: Promise<PulseQuoteSuccess | null> = Promise.resolve()
			.then(() => readQuote({ network, asset }))
			.catch((err): PulseQuoteResult => {
				logger.warn('[PricesRoute] Reflector quote read failed, failing closed:', err)
				return { status: 'missing' }
			})
			.then((result): PulseQuoteSuccess | null => {
				if (!isValidPulseQuote(result)) {
					cache.delete(cacheKey)
					return null
				}

				const quote: PulseQuoteSuccess = {
					price: result.price,
					decimals: result.decimals,
					timestamp: result.timestamp,
					source: result.source,
					feedContractId: result.feedContractId,
				}

				cache.set(cacheKey, {
					quote,
					expiresAt: now() + cacheTtlMs,
				})

				return quote
			})
			.finally(() => {
				if (inFlight.get(cacheKey) === promise) {
					inFlight.delete(cacheKey)
				}
			})

		inFlight.set(cacheKey, promise)
		return promise
	}

	return async (req: NextRequest): Promise<NextResponse> => {
		const searchParams = req.nextUrl.searchParams

		for (const key of searchParams.keys()) {
			if (key !== 'asset') {
				return NextResponse.json(
					{ error: 'Only the asset query parameter is supported.' },
					{
						status: 400,
						headers: { 'Cache-Control': 'no-store' },
					},
				)
			}
		}

		const assetValues = searchParams.getAll('asset')
		const asset = assetValues.length === 1 ? assetValues[0] : null
		if (!isSupportedAsset(asset)) {
			return NextResponse.json(
				{ error: 'Invalid or missing asset parameter. Expected XLM or USDC.' },
				{
					status: 400,
					headers: { 'Cache-Control': 'no-store' },
				},
			)
		}

		const network = getNetwork()
		const cacheKey = `${network}:${asset}`
		const cached = cache.get(cacheKey)

		if (cached && now() < cached.expiresAt) {
			return NextResponse.json(cached.quote, {
				status: 200,
				headers: { 'Cache-Control': PRICE_CACHE_CONTROL_HEADER },
			})
		}

		const quote = await fetchQuoteCoalesced(cacheKey, network, asset)

		if (!quote) {
			return NextResponse.json(
				{ status: 'unavailable' },
				{
					status: 503,
					headers: { 'Cache-Control': 'no-store' },
				},
			)
		}

		return NextResponse.json(quote, {
			status: 200,
			headers: { 'Cache-Control': PRICE_CACHE_CONTROL_HEADER },
		})
	}
}
