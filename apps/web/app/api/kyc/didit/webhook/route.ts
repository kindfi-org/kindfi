// app/api/kyc/didit/webhook/route.ts

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
	verifyDiditWebhookSignatureSimple,
	verifyDiditWebhookSignatureV2,
} from '~/lib/services/didit'
import { mapDiditStatusToKYC } from '../../../../../lib/services/didit'

interface DiditWebhookEvent extends Record<string, unknown> {
	session_id: string
	status:
		| 'Not Started'
		| 'In Progress'
		| 'Approved'
		| 'Declined'
		| 'In Review'
		| 'Abandoned'
	webhook_type: 'status.updated' | 'data.updated'
	created_at?: number
	timestamp: number
	workflow_id?: string
	vendor_data?: string
	metadata?: Record<string, unknown>
	decision?: Record<string, unknown>
}

/**
 * POST /api/kyc/didit/webhook
 *
 * Handles Didit webhook events for verification status updates
 */
export async function POST(req: NextRequest) {
	try {
		const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET_KEY

		if (!webhookSecret) {
			console.error('DIDIT_WEBHOOK_SECRET_KEY is not configured')
			return NextResponse.json(
				{ error: 'Webhook secret not configured' },
				{ status: 500 },
			)
		}

		// Get raw body and parse JSON
		const rawBody = await req.text()
		const jsonBody: DiditWebhookEvent = JSON.parse(rawBody)

		// Get signature headers (try V2 first, then Simple)
		const signatureV2 = req.headers.get('x-signature-v2')
		const signatureSimple = req.headers.get('x-signature-simple')
		const timestamp = req.headers.get('x-timestamp')

		if (!timestamp) {
			return NextResponse.json(
				{ error: 'Missing timestamp header' },
				{ status: 401 },
			)
		}

		// Verify signature - try V2 first (recommended), then Simple (fallback)
		let isValid = false
		if (signatureV2) {
			isValid = verifyDiditWebhookSignatureV2(
				jsonBody,
				signatureV2,
				timestamp,
				webhookSecret,
			)
			if (isValid) {
				console.log('Webhook verified with X-Signature-V2')
			}
		}

		if (!isValid && signatureSimple) {
			isValid = verifyDiditWebhookSignatureSimple(
				jsonBody,
				signatureSimple,
				timestamp,
				webhookSecret,
			)
			if (isValid) {
				console.log('Webhook verified with X-Signature-Simple (fallback)')
			}
		}

		if (!isValid) {
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
		}

		const supabase = await createSupabaseServerClient()

		// Find user by session ID stored in notes
		const { data: kycRecords, error: findError } = await supabase
			.from('kyc_reviews')
			.select('user_id, notes')
			.like('notes', `%${jsonBody.session_id}%`)

		if (findError || !kycRecords || kycRecords.length === 0) {
			console.error('KYC record not found for session:', jsonBody.session_id)
			// Return 200 to prevent retries for sessions we don't have
			return NextResponse.json({ received: true })
		}

		const kycRecord = kycRecords[0]
		const notes =
			typeof kycRecord.notes === 'string'
				? JSON.parse(kycRecord.notes)
				: kycRecord.notes

		const kycStatus = mapDiditStatusToKYC(jsonBody.status)
		// Update KYC record
		const { error: updateError } = await supabase
			.from('kyc_reviews')
			.update({
				status: kycStatus,
				notes: JSON.stringify({
					...notes,
					diditSessionId: jsonBody.session_id,
					diditStatus: jsonBody.status,
					lastUpdated: new Date(jsonBody.timestamp * 1000).toISOString(),
					webhookEvent: jsonBody.webhook_type,
					...(jsonBody.decision && { decision: jsonBody.decision }),
				}),
				updated_at: new Date().toISOString(),
			})
			.eq('user_id', kycRecord.user_id)

		if (updateError) {
			console.error('Failed to update KYC record:', updateError)
			// Return 500 to trigger retry
			return NextResponse.json(
				{ error: 'Failed to update KYC record' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ received: true })
	} catch (error) {
		console.error('Error processing Didit webhook:', error)
		return NextResponse.json(
			{
				error: 'Failed to process webhook',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
