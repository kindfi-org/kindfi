import { logger } from '@/lib/logger'
import { isStaleProviderEvent } from './provider-event'
import {
	activatePollarIfApproved,
	findDiditSessionBySessionId,
	recordKycStatusTransition,
	upsertKycReviewStatus,
} from './session-service'
import { toCanonicalKycStatus } from './status'
import { getKycSchemaClient } from './supabase-kyc-client'
import type { CanonicalKycStatus } from './types'

export interface DiditStatusUpdateInput {
	sessionId: string
	diditStatus: string
	userId?: string
	source: 'webhook' | 'callback' | 'check_status'
	eventId?: string | null
	webhookType?: string | null
	providerEventAt?: Date | null
}

export type DiditStatusUpdateResult =
	| { applied: true; canonicalStatus: CanonicalKycStatus; userId: string }
	| {
			applied: false
			reason: 'duplicate' | 'stale' | 'unmapped' | 'not_found' | 'error'
			canonicalStatus?: CanonicalKycStatus
			userId?: string
	  }

const resolveEventId = (input: DiditStatusUpdateInput): string => {
	if (input.eventId && input.eventId.trim().length > 0) {
		return input.eventId.trim()
	}

	const stamp = input.providerEventAt?.toISOString() ?? 'unknown-time'
	return `${input.sessionId}:${stamp}:${input.webhookType ?? input.source}:${input.diditStatus}`
}

const toIso = (value: Date | null | undefined): string | null => {
	if (!value || Number.isNaN(value.getTime())) return null
	return value.toISOString()
}

const recordWebhookEvent = async (params: {
	eventId: string
	sessionId: string
	userId?: string | null
	webhookType?: string | null
	diditStatus: string
	processingResult: 'applied' | 'duplicate' | 'stale' | 'unmapped' | 'error'
	providerEventAt: string | null
}): Promise<'inserted' | 'duplicate' | 'error'> => {
	const { error } = await getKycSchemaClient()
		.from('webhook_events')
		.insert({
			event_id: params.eventId,
			session_id: params.sessionId,
			user_id: params.userId ?? null,
			webhook_type: params.webhookType ?? null,
			didit_status: params.diditStatus,
			processing_result: params.processingResult,
			provider_event_at: params.providerEventAt,
		})

	if (!error) return 'inserted'
	if (error.code === '23505') return 'duplicate'

	logger.error('[kyc] Failed to record webhook event', { error: error.message })
	return 'error'
}

/**
 * Apply a Didit status update with idempotency and monotonic timestamps.
 * Delayed events are stored but cannot regress a newer verification status.
 * Does not persist Didit decision payloads, documents, or biometrics.
 */
export const applyDiditStatusUpdate = async (
	input: DiditStatusUpdateInput,
): Promise<DiditStatusUpdateResult> => {
	const canonicalStatus = toCanonicalKycStatus(input.diditStatus)
	const eventId = resolveEventId(input)
	const providerEventAt = toIso(input.providerEventAt)

	const existing = await findDiditSessionBySessionId(input.sessionId)
	const userId = existing?.userId ?? input.userId

	if (!userId) {
		await recordWebhookEvent({
			eventId,
			sessionId: input.sessionId,
			diditStatus: input.diditStatus,
			webhookType: input.webhookType,
			processingResult: 'error',
			providerEventAt,
		})
		return { applied: false, reason: 'not_found' }
	}

	const insertResult = await recordWebhookEvent({
		eventId,
		sessionId: input.sessionId,
		userId,
		diditStatus: input.diditStatus,
		webhookType: input.webhookType,
		processingResult: 'applied',
		providerEventAt,
	})

	if (insertResult === 'duplicate') {
		return { applied: false, reason: 'duplicate', canonicalStatus, userId }
	}

	if (insertResult === 'error') {
		return { applied: false, reason: 'error', canonicalStatus, userId }
	}

	if (
		existing &&
		isStaleProviderEvent(
			providerEventAt,
			existing.lastProviderEventAt,
			canonicalStatus,
			existing.canonicalStatus,
		)
	) {
		await getKycSchemaClient()
			.from('webhook_events')
			.update({ processing_result: 'stale' })
			.eq('event_id', eventId)
		return { applied: false, reason: 'stale', canonicalStatus, userId }
	}

	const reviewId = await upsertKycReviewStatus({
		userId,
		canonicalStatus,
		existingReviewId: existing?.kycReviewId,
	})

	const { error: sessionError } = await getKycSchemaClient().from('didit_sessions').upsert(
		{
			user_id: userId,
			kyc_review_id: reviewId,
			session_id: input.sessionId,
			didit_status: input.diditStatus,
			canonical_status: canonicalStatus,
			last_provider_event_id: eventId,
			last_provider_event_at: providerEventAt,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'session_id' },
	)

	if (sessionError) {
		logger.error('[kyc] Failed to update Didit session status', { error: sessionError.message })
		await getKycSchemaClient()
			.from('webhook_events')
			.update({ processing_result: 'error' })
			.eq('event_id', eventId)
		return { applied: false, reason: 'error', canonicalStatus, userId }
	}

	await recordKycStatusTransition({
		userId,
		sessionId: input.sessionId,
		fromDiditStatus: existing?.diditStatus,
		toDiditStatus: input.diditStatus,
		fromCanonicalStatus: existing?.canonicalStatus,
		toCanonicalStatus: canonicalStatus,
		source: input.source,
		providerEventId: eventId,
		providerEventAt,
	})

	await activatePollarIfApproved(userId, canonicalStatus)

	return { applied: true, canonicalStatus, userId }
}
