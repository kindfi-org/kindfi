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

type WebhookEventProcessingResult = 'applied' | 'duplicate' | 'stale' | 'unmapped' | 'error'

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

const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : String(error)

/**
 * Claim the idempotency record for a provider event.
 *
 * `inserted` means this caller owns the event and must apply the status.
 * `duplicate` means a previous attempt already APPLIED (or deliberately
 * skipped) it, so it must not be processed again.
 *
 * A record left behind by a FAILED attempt (`processing_result: 'error'`) is
 * reclaimed instead of reported as a duplicate. Without that reclaim the unique
 * constraint on `event_id` would make a provider event permanently
 * unretryable: the first attempt would insert the row, fail downstream, and
 * every retry from Didit would then be rejected as a duplicate.
 */
const claimWebhookEvent = async (params: {
	eventId: string
	sessionId: string
	userId?: string | null
	webhookType?: string | null
	diditStatus: string
	providerEventAt: string | null
}): Promise<'inserted' | 'duplicate' | 'error'> => {
	const client = getKycSchemaClient()

	const { error } = await client.from('webhook_events').insert({
		event_id: params.eventId,
		session_id: params.sessionId,
		user_id: params.userId ?? null,
		webhook_type: params.webhookType ?? null,
		didit_status: params.diditStatus,
		processing_result: 'applied',
		provider_event_at: params.providerEventAt,
	})

	if (!error) return 'inserted'
	if (error.code !== '23505') {
		logger.error('[kyc] Failed to record webhook event', { error: error.message })
		return 'error'
	}

	const { data, error: readError } = await client
		.from('webhook_events')
		.select('event_id, processing_result')
		.eq('event_id', params.eventId)
		.maybeSingle()

	if (readError) {
		logger.error('[kyc] Failed to inspect webhook event record', {
			error: readError.message,
		})
		return 'error'
	}

	if (!data || data.processing_result !== 'error') return 'duplicate'

	// Compare-and-set on `processing_result` so two concurrent retries cannot
	// both reclaim the same failed record.
	const { data: reclaimed, error: reclaimError } = await client
		.from('webhook_events')
		.update({ processing_result: 'applied' })
		.eq('event_id', params.eventId)
		.eq('processing_result', 'error')
		.select('event_id')

	if (reclaimError) {
		logger.error('[kyc] Failed to reclaim failed webhook event for retry', {
			error: reclaimError.message,
		})
		return 'error'
	}

	if (!reclaimed || reclaimed.length === 0) return 'duplicate'

	return 'inserted'
}

/**
 * Mark a claimed event as failed so Didit's next delivery of the same event ID
 * can re-run it. Best effort by design: a failure here must never turn a
 * recoverable processing failure into an unhandled throw.
 */
const releaseFailedWebhookEvent = async (
	eventId: string,
	context: string,
): Promise<void> => {
	try {
		const { error } = await getKycSchemaClient()
			.from('webhook_events')
			.update({ processing_result: 'error' })
			.eq('event_id', eventId)

		if (error) {
			logger.error('[kyc] Failed to release webhook event for retry', {
				context,
				error: error.message,
			})
		}
	} catch (releaseError) {
		logger.error('[kyc] Failed to release webhook event for retry', {
			context,
			error: errorMessage(releaseError),
		})
	}
}

/**
 * Record a delivery that could not be attributed to a user. It is stored as a
 * failure so the audit trail keeps the delivery while leaving it retryable once
 * the session is linked to a user.
 */
const recordUnattributedWebhookEvent = async (params: {
	eventId: string
	sessionId: string
	diditStatus: string
	webhookType?: string | null
	providerEventAt: string | null
}): Promise<void> => {
	try {
		const { error } = await getKycSchemaClient()
			.from('webhook_events')
			.insert({
				event_id: params.eventId,
				session_id: params.sessionId,
				user_id: null,
				webhook_type: params.webhookType ?? null,
				didit_status: params.diditStatus,
				processing_result: 'error',
				provider_event_at: params.providerEventAt,
			})

		if (error && error.code !== '23505') {
			logger.error('[kyc] Failed to record unattributed webhook event', {
				error: error.message,
			})
		}
	} catch (recordError) {
		logger.error('[kyc] Failed to record unattributed webhook event', {
			error: errorMessage(recordError),
		})
	}
}

const markWebhookEventResult = async (
	eventId: string,
	processingResult: WebhookEventProcessingResult,
): Promise<void> => {
	try {
		const { error } = await getKycSchemaClient()
			.from('webhook_events')
			.update({ processing_result: processingResult })
			.eq('event_id', eventId)

		if (error) {
			logger.error('[kyc] Failed to mark webhook event outcome', {
				error: error.message,
			})
		}
	} catch (markError) {
		logger.error('[kyc] Failed to mark webhook event outcome', {
			error: errorMessage(markError),
		})
	}
}

/**
 * Apply a Didit status update with idempotency and monotonic timestamps.
 * Delayed events are stored but cannot regress a newer verification status.
 * Does not persist Didit decision payloads, documents, or biometrics.
 *
 * Retryability contract: an event that fails after it claimed its idempotency
 * record is released back to `processing_result: 'error'` (or returns
 * `reason: 'error'`), so the same event ID can be delivered again. An event that
 * was applied stays deduplicated.
 */
export const applyDiditStatusUpdate = async (
	input: DiditStatusUpdateInput,
): Promise<DiditStatusUpdateResult> => {
	const canonicalStatus = toCanonicalKycStatus(input.diditStatus)
	const eventId = resolveEventId(input)
	const providerEventAt = toIso(input.providerEventAt)

	const existing = await findDiditSessionBySessionId(input.sessionId)
	if (existing && input.userId && existing.userId !== input.userId) {
		return { applied: false, reason: 'not_found' }
	}
	const userId = existing?.userId

	if (!userId) {
		await recordUnattributedWebhookEvent({
			eventId,
			sessionId: input.sessionId,
			diditStatus: input.diditStatus,
			webhookType: input.webhookType,
			providerEventAt,
		})
		return { applied: false, reason: 'not_found' }
	}

	const claimResult = await claimWebhookEvent({
		eventId,
		sessionId: input.sessionId,
		userId,
		diditStatus: input.diditStatus,
		webhookType: input.webhookType,
		providerEventAt,
	})

	if (claimResult === 'duplicate') {
		return { applied: false, reason: 'duplicate', canonicalStatus, userId }
	}

	if (claimResult === 'error') {
		return { applied: false, reason: 'error', canonicalStatus, userId }
	}

	try {
		if (
			existing &&
			isStaleProviderEvent(
				providerEventAt,
				existing.lastProviderEventAt,
				canonicalStatus,
				existing.canonicalStatus,
			)
		) {
			await markWebhookEventResult(eventId, 'stale')
			return { applied: false, reason: 'stale', canonicalStatus, userId }
		}

		const reviewId = await upsertKycReviewStatus({
			userId,
			canonicalStatus,
			existingReviewId: existing?.kycReviewId,
		})

		const updateConditions = providerEventAt
			? `last_provider_event_at.is.null,last_provider_event_at.lt.${providerEventAt},and(last_provider_event_at.eq.${providerEventAt},canonical_status.not.in.(approved,rejected))`
			: 'last_provider_event_at.is.null'

		const { data: updatedSession, error: sessionError } = await getKycSchemaClient()
			.from('didit_sessions')
			.update({
				user_id: userId,
				kyc_review_id: reviewId,
				didit_status: input.diditStatus,
				canonical_status: canonicalStatus,
				last_provider_event_id: eventId,
				last_provider_event_at: providerEventAt,
				updated_at: new Date().toISOString(),
			})
			.eq('session_id', input.sessionId)
			.or(updateConditions)
			.select('session_id')

		if (sessionError) {
			logger.error('[kyc] Failed to update Didit session status', {
				error: sessionError.message,
			})
			await releaseFailedWebhookEvent(eventId, 'session_update_failed')
			return { applied: false, reason: 'error', canonicalStatus, userId }
		}

		if (!updatedSession || updatedSession.length === 0) {
			await markWebhookEventResult(eventId, 'stale')
			return { applied: false, reason: 'stale', canonicalStatus, userId }
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
	} catch (applicationError) {
		// Any unexpected throw between the claim and the application leaves the
		// event unapplied. Release the claim so the provider can retry it rather
		// than losing the status transition behind a duplicate-key rejection.
		logger.error('[kyc] Failed to apply Didit status update', {
			error: errorMessage(applicationError),
		})
		await releaseFailedWebhookEvent(eventId, 'unexpected_error')
		return { applied: false, reason: 'error', canonicalStatus, userId }
	}
}
