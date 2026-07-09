import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import {
	getTrustlessWorkApiBaseUrl,
	getTrustlessWorkApiKey,
} from '~/lib/config/trustless-work.config'
import {
	isAllowedTrustlessWorkPath,
	isPublicTrustlessWorkRead,
} from '~/lib/config/trustless-work-proxy.paths'
import {
	submitTrustlessSignedTransaction,
	TrustlessStellarSubmitError,
} from '~/lib/services/submit-trustless-signed-transaction.service'

const publicReadLimiter = new RateLimiter({
	maxAttempts: 120,
	windowSecs: 60,
	blockSecs: 300,
	configId: 'tw-proxy-public',
})

const getClientIp = (request: Request): string =>
	request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

const readSignedXdrFromBody = (body: string | undefined): string | null => {
	if (!body) return null

	try {
		const parsed = JSON.parse(body) as { signedXdr?: unknown }
		return typeof parsed.signedXdr === 'string' && parsed.signedXdr.trim().length > 0
			? parsed.signedXdr
			: null
	} catch {
		return null
	}
}

const notifyTrustlessWorkIndexer = async (txHash: string): Promise<void> => {
	const apiKey = getTrustlessWorkApiKey()
	if (!apiKey) return

	try {
		await fetch(`${getTrustlessWorkApiBaseUrl()}/indexer/update-from-txHash`, {
			method: 'POST',
			headers: {
				'x-api-key': apiKey,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ txHash }),
			cache: 'no-store',
		})
	} catch (error) {
		logger.error('Trustless Work indexer update failed after local submit:', error)
	}
}

const isTxBadAuthUpstreamBody = (body: string): boolean => {
	const normalized = body.toLowerCase()
	return normalized.includes('tx_bad_auth') || normalized.includes('txbadauth')
}

/**
 * Prefer Trustless Work's helper/send-transaction so factory deploys return
 * contractId + escrow. Fall back to direct Soroban submit only when TW rejects
 * with tx_bad_auth (network mismatch), then notify the indexer.
 */
const handleSendTransaction = async (
	headers: Record<string, string>,
	body: string | undefined,
): Promise<Response> => {
	const signedXdr = readSignedXdrFromBody(body)
	if (!signedXdr) {
		return NextResponse.json({ statusCode: 400, message: 'signedXdr is required' }, { status: 400 })
	}

	const upstreamUrl = `${getTrustlessWorkApiBaseUrl()}/helper/send-transaction`

	try {
		const upstreamResponse = await fetch(upstreamUrl, {
			method: 'POST',
			headers,
			body: body || undefined,
			cache: 'no-store',
		})

		const responseBody = await upstreamResponse.text()

		if (upstreamResponse.ok || !isTxBadAuthUpstreamBody(responseBody)) {
			return new Response(responseBody, {
				status: upstreamResponse.status,
				headers: {
					'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json',
				},
			})
		}

		logger.error(
			'Trustless Work helper/send-transaction returned tx_bad_auth; retrying via Soroban RPC',
			{
				status: upstreamResponse.status,
			},
		)
	} catch (error) {
		logger.error('Trustless Work helper/send-transaction failed; retrying via Soroban RPC:', error)
	}

	try {
		const result = await submitTrustlessSignedTransaction(signedXdr)
		void notifyTrustlessWorkIndexer(result.hash)

		return NextResponse.json({
			status: result.status,
			message: result.message,
			hash: result.hash,
		})
	} catch (error) {
		if (error instanceof TrustlessStellarSubmitError) {
			return NextResponse.json(
				{
					statusCode: 400,
					message: error.message,
					path: '/helper/send-transaction',
				},
				{ status: 400 },
			)
		}

		logger.error('Trustless Work local send-transaction failed:', error)
		return NextResponse.json(
			{
				statusCode: 500,
				message: 'Failed to submit transaction to Stellar',
				path: '/helper/send-transaction',
			},
			{ status: 500 },
		)
	}
}

export async function proxyTrustlessWorkRequest(
	request: Request,
	pathSegments: string[],
): Promise<Response> {
	const apiKey = getTrustlessWorkApiKey()
	if (!apiKey) {
		return NextResponse.json({ error: 'Trustless Work API key not configured' }, { status: 503 })
	}

	if (pathSegments.length === 0) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 })
	}

	const path = pathSegments.join('/')
	if (!isAllowedTrustlessWorkPath(path)) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
	}

	const method = request.method.toUpperCase()

	if (isPublicTrustlessWorkRead(method, path)) {
		const rateLimit = await publicReadLimiter.increment(getClientIp(request), path)
		if (rateLimit.isBlocked) {
			return NextResponse.json(
				{ error: 'Too many requests. Please try again later.' },
				{ status: 429, headers: { 'Retry-After': '300' } },
			)
		}
	} else {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
	}

	const upstreamUrl = new URL(`${getTrustlessWorkApiBaseUrl()}/${path}`)
	upstreamUrl.search = new URL(request.url).search

	const headers: Record<string, string> = {
		'x-api-key': apiKey,
		Accept: request.headers.get('Accept') || 'application/json',
	}

	const contentType = request.headers.get('Content-Type')
	if (contentType) {
		headers['Content-Type'] = contentType
	}

	const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined

	if (path === 'helper/send-transaction' && method === 'POST') {
		return handleSendTransaction(headers, body)
	}

	try {
		const upstreamResponse = await fetch(upstreamUrl.toString(), {
			method,
			headers,
			body: body || undefined,
			cache: 'no-store',
		})

		const responseBody = await upstreamResponse.text()

		return new Response(responseBody, {
			status: upstreamResponse.status,
			headers: {
				'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json',
			},
		})
	} catch (error) {
		logger.error('Trustless Work proxy request failed:', error)
		return NextResponse.json({ error: 'Failed to reach Trustless Work' }, { status: 502 })
	}
}
