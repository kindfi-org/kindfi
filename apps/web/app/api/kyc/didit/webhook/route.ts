import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { applyDiditStatusUpdate } from '~/lib/kyc/webhook-service'
import {
	verifyDiditWebhookSignatureSimple,
	verifyDiditWebhookSignatureV2,
} from '~/lib/services/didit'

interface DiditWebhookEvent extends Record<string, unknown> {
	session_id: string
	status: string
	webhook_type?: string
	created_at?: number
	timestamp?: number
	webhook_id?: string
	event_id?: string
	id?: string
	vendor_data?: string
}

const parseProviderEventAt = (jsonBody: DiditWebhookEvent, headerTimestamp: string): Date => {
	if (typeof jsonBody.timestamp === 'number') {
		return new Date(jsonBody.timestamp * 1000)
	}
	if (typeof jsonBody.created_at === 'number') {
		const value = jsonBody.created_at
		return value > 1_000_000_000_000 ? new Date(value) : new Date(value * 1000)
	}
	const header = Number.parseInt(headerTimestamp, 10)
	if (!Number.isNaN(header)) {
		return new Date(header * 1000)
	}
	return new Date()
}

const resolveWebhookEventId = (jsonBody: DiditWebhookEvent): string | null => {
	if (typeof jsonBody.webhook_id === 'string' && jsonBody.webhook_id.length > 0) {
		return jsonBody.webhook_id
	}
	if (typeof jsonBody.event_id === 'string' && jsonBody.event_id.length > 0) {
		return jsonBody.event_id
	}
	if (typeof jsonBody.id === 'string' && jsonBody.id.length > 0) {
		return jsonBody.id
	}
	return null
}

/**
 * POST /api/kyc/didit/webhook
 *
 * Handles Didit webhook events for verification status updates.
 * Signatures are verified before any payload is processed.
 */
export async function POST(req: NextRequest) {
	try {
		const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET_KEY

		if (!webhookSecret) {
			logger.error('DIDIT_WEBHOOK_SECRET_KEY is not configured')
			return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
		}

		const rawBody = await req.text()
		const jsonBody: DiditWebhookEvent = JSON.parse(rawBody)

		const signatureV2 = req.headers.get('x-signature-v2')
		const signatureSimple = req.headers.get('x-signature-simple')
		const timestamp = req.headers.get('x-timestamp')

		if (!timestamp) {
			return NextResponse.json({ error: 'Missing timestamp header' }, { status: 401 })
		}

		let isValid = false
		if (signatureV2) {
			isValid = verifyDiditWebhookSignatureV2(jsonBody, signatureV2, timestamp, webhookSecret)
		}

		if (!isValid && signatureSimple) {
			isValid = verifyDiditWebhookSignatureSimple(
				jsonBody,
				signatureSimple,
				timestamp,
				webhookSecret,
			)
		}

		if (!isValid) {
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
		}

		if (!jsonBody.session_id || !jsonBody.status) {
			return NextResponse.json({ received: true })
		}

		const result = await applyDiditStatusUpdate({
			sessionId: jsonBody.session_id,
			diditStatus: jsonBody.status,
			userId: typeof jsonBody.vendor_data === 'string' ? jsonBody.vendor_data : undefined,
			source: 'webhook',
			eventId: resolveWebhookEventId(jsonBody),
			webhookType: jsonBody.webhook_type,
			providerEventAt: parseProviderEventAt(jsonBody, timestamp),
		})

		if (!result.applied && result.reason === 'not_found') {
			logger.warn('[kyc] Webhook for unknown Didit session', {
				sessionId: jsonBody.session_id,
				webhookType: jsonBody.webhook_type,
			})
		}

		return NextResponse.json({ received: true })
	} catch (error) {
		logger.error('Error processing Didit webhook:', error)
		return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
	}
}
