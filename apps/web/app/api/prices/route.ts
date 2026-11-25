import { withRateLimit } from '~/lib/middleware/rate-limit'
import { createPricesGetHandler, getPricesClientIp } from '~/lib/prices/prices-route-handler'
import { readPulseQuote } from '~/lib/stellar/reflector-pulse'

export const dynamic = 'force-dynamic'

const pricesHandler = createPricesGetHandler({
	readQuote: readPulseQuote,
})

/**
 * GET /api/prices?asset=XLM|USDC
 *
 * Public, unauthenticated price endpoint backed by Reflector Pulse.
 * Rate-limited per IP via Upstash Redis (`lenient` preset: 30 req/min).
 * Responses are cached in-memory and at the CDN for 60 seconds and fail closed
 * with 503 `{ status: "unavailable" }` when quotes are missing or stale.
 */
export const GET = withRateLimit(
	{
		preset: 'lenient',
		identifier: getPricesClientIp,
	},
	pricesHandler,
)
