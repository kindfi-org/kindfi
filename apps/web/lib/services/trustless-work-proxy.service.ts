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

const publicReadLimiter = new RateLimiter({
	maxAttempts: 120,
	windowSecs: 60,
	blockSecs: 300,
	configId: 'tw-proxy-public',
})

const getClientIp = (request: Request): string =>
	request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

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
