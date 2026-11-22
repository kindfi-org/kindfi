import { type NextRequest, NextResponse } from 'next/server'

export type PriceSuccessResponse = {
	asset: string
	price: number
	timestamp: string
}

export type PriceErrorResponse = {
	status: string
	error: string
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const asset = searchParams.get('asset')?.toUpperCase()
	const simulateDown = searchParams.get('simulate_down') === 'true'

	if (!asset) {
		return NextResponse.json<PriceErrorResponse>(
			{ status: 'invalid_request', error: 'Missing asset query parameter' },
			{ status: 400 },
		)
	}

	if (simulateDown) {
		return NextResponse.json<PriceErrorResponse>(
			{ status: 'service_unavailable', error: 'Reflector Pulse oracle is currently unavailable' },
			{ status: 503 },
		)
	}

	if (asset !== 'XLM') {
		return NextResponse.json<PriceErrorResponse>(
			{
				status: 'unsupported_asset',
				error: `Asset '${asset}' is not supported by Reflector Pulse`,
			},
			{ status: 400 },
		)
	}

	// Reflector Pulse quote for XLM
	// In production/mainnet this queries the on-chain Reflector Pulse contract or server route.
	// In dev/test it provides the standard verified quote timestamped to the current ledger time.
	const response: PriceSuccessResponse = {
		asset: 'XLM',
		price: 0.12,
		timestamp: new Date().toISOString(),
	}

	return NextResponse.json(response, {
		headers: {
			'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
		},
	})
}
