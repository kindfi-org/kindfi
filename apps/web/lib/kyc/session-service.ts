import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import {
	canonicalFromDbStatus,
	isActiveDiditSessionStatus,
	toCanonicalKycStatus,
	toKycDbStatus,
} from './status'
import { getKycSchemaClient } from './supabase-kyc-client'
import type { CanonicalKycStatus, KycDbStatus } from './types'

export interface DiditSessionRecord {
	id: string
	userId: string
	kycReviewId: string | null
	sessionId: string
	verificationUrl: string | null
	diditStatus: string | null
	canonicalStatus: CanonicalKycStatus
	lastProviderEventId: string | null
	lastProviderEventAt: string | null
}

interface DiditSessionRow {
	id: string
	user_id: string
	kyc_review_id: string | null
	session_id: string
	verification_url: string | null
	didit_status: string | null
	canonical_status: string
	last_provider_event_id: string | null
	last_provider_event_at: string | null
}

const mapSessionRow = (row: DiditSessionRow): DiditSessionRecord => ({
	id: row.id,
	userId: row.user_id,
	kycReviewId: row.kyc_review_id,
	sessionId: row.session_id,
	verificationUrl: row.verification_url,
	diditStatus: row.didit_status,
	canonicalStatus: toCanonicalKycStatus(row.canonical_status),
	lastProviderEventId: row.last_provider_event_id,
	lastProviderEventAt: row.last_provider_event_at,
})

export const findDiditSessionBySessionId = async (
	sessionId: string,
): Promise<DiditSessionRecord | null> => {
	const { data, error } = await getKycSchemaClient()
		.from('didit_sessions')
		.select(
			'id, user_id, kyc_review_id, session_id, verification_url, didit_status, canonical_status, last_provider_event_id, last_provider_event_at',
		)
		.eq('session_id', sessionId)
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to load Didit session by session_id', { error: error.message })
		return null
	}

	return data ? mapSessionRow(data as DiditSessionRow) : null
}

export const findLatestDiditSessionForUser = async (
	userId: string,
): Promise<DiditSessionRecord | null> => {
	const { data, error } = await getKycSchemaClient()
		.from('didit_sessions')
		.select(
			'id, user_id, kyc_review_id, session_id, verification_url, didit_status, canonical_status, last_provider_event_id, last_provider_event_at',
		)
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to load latest Didit session', { error: error.message })
		return null
	}

	return data ? mapSessionRow(data as DiditSessionRow) : null
}

export const findActiveDiditSessionForUser = async (
	userId: string,
): Promise<DiditSessionRecord | null> => {
	const { data, error } = await getKycSchemaClient()
		.from('didit_sessions')
		.select(
			'id, user_id, kyc_review_id, session_id, verification_url, didit_status, canonical_status, last_provider_event_id, last_provider_event_at',
		)
		.eq('user_id', userId)
		.in('canonical_status', ['not_started', 'pending', 'in_review', 'manual_review'])
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to load active Didit session', { error: error.message })
		return null
	}

	if (!data) return null
	const session = mapSessionRow(data as DiditSessionRow)
	return isActiveDiditSessionStatus(session.canonicalStatus) ? session : null
}

const findLatestKycReview = async (
	userId: string,
): Promise<{ id: string; status: KycDbStatus } | null> => {
	const { data, error } = await supabaseServiceRole
		.from('kyc_reviews')
		.select('id, status')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to load KYC review', { error: error.message })
		return null
	}

	if (!data) return null
	return { id: data.id, status: data.status as KycDbStatus }
}

export const getCanonicalKycStatusForUser = async (userId: string): Promise<CanonicalKycStatus> => {
	const session = await findLatestDiditSessionForUser(userId)
	if (session) {
		return session.canonicalStatus
	}

	const review = await findLatestKycReview(userId)
	return canonicalFromDbStatus(review?.status)
}

export const upsertKycReviewStatus = async (params: {
	userId: string
	canonicalStatus: CanonicalKycStatus
	existingReviewId?: string | null
}): Promise<string | null> => {
	const dbStatus = toKycDbStatus(params.canonicalStatus)

	if (params.existingReviewId) {
		const { error } = await supabaseServiceRole
			.from('kyc_reviews')
			.update({
				status: dbStatus,
				updated_at: new Date().toISOString(),
			})
			.eq('id', params.existingReviewId)

		if (error) {
			logger.error('[kyc] Failed to update KYC review status', { error: error.message })
			return params.existingReviewId
		}
		return params.existingReviewId
	}

	const existing = await findLatestKycReview(params.userId)
	if (existing) {
		const { error } = await supabaseServiceRole
			.from('kyc_reviews')
			.update({
				status: dbStatus,
				updated_at: new Date().toISOString(),
			})
			.eq('id', existing.id)

		if (error) {
			logger.error('[kyc] Failed to update KYC review status', { error: error.message })
		}
		return existing.id
	}

	const { data, error } = await supabaseServiceRole
		.from('kyc_reviews')
		.insert({
			user_id: params.userId,
			status: dbStatus,
			verification_level: 'enhanced',
		})
		.select('id')
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to create KYC review', { error: error.message })
		return null
	}

	return data?.id ?? null
}

export const saveDiditSession = async (params: {
	userId: string
	sessionId: string
	sessionToken?: string
	verificationUrl?: string
	diditStatus?: string
	canonicalStatus: CanonicalKycStatus
	kycReviewId?: string | null
}): Promise<DiditSessionRecord | null> => {
	const reviewId =
		params.kycReviewId ??
		(await upsertKycReviewStatus({
			userId: params.userId,
			canonicalStatus: params.canonicalStatus,
		}))

	const now = new Date().toISOString()
	const { data, error } = await getKycSchemaClient()
		.from('didit_sessions')
		.upsert(
			{
				user_id: params.userId,
				kyc_review_id: reviewId,
				session_id: params.sessionId,
				session_token: params.sessionToken ?? null,
				verification_url: params.verificationUrl ?? null,
				didit_status: params.diditStatus ?? null,
				canonical_status: params.canonicalStatus,
				updated_at: now,
			},
			{ onConflict: 'session_id' },
		)
		.select(
			'id, user_id, kyc_review_id, session_id, verification_url, didit_status, canonical_status, last_provider_event_id, last_provider_event_at',
		)
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to save Didit session', { error: error.message })
		return null
	}

	return data ? mapSessionRow(data as DiditSessionRow) : null
}

export const recordKycStatusTransition = async (params: {
	userId: string
	sessionId?: string | null
	fromDiditStatus?: string | null
	toDiditStatus?: string | null
	fromCanonicalStatus?: CanonicalKycStatus | null
	toCanonicalStatus: CanonicalKycStatus
	source: 'webhook' | 'callback' | 'check_status' | 'create_session' | 'backfill'
	providerEventId?: string | null
	providerEventAt?: string | null
}): Promise<void> => {
	if (params.fromCanonicalStatus === params.toCanonicalStatus) {
		return
	}

	const { error } = await getKycSchemaClient()
		.from('status_history')
		.insert({
			user_id: params.userId,
			session_id: params.sessionId ?? null,
			from_didit_status: params.fromDiditStatus ?? null,
			to_didit_status: params.toDiditStatus ?? null,
			from_canonical_status: params.fromCanonicalStatus ?? null,
			to_canonical_status: params.toCanonicalStatus,
			source: params.source,
			provider_event_id: params.providerEventId ?? null,
			provider_event_at: params.providerEventAt ?? null,
		})

	if (error) {
		logger.error('[kyc] Failed to record status transition', { error: error.message })
	}
}

export const activatePollarIfApproved = async (
	userId: string,
	canonicalStatus: CanonicalKycStatus,
): Promise<void> => {
	if (canonicalStatus !== 'approved') return

	try {
		const { activatePollarWalletForProfile } = await import('~/lib/pollar/bridge/link-pollar-user')
		await activatePollarWalletForProfile(userId)
	} catch (activationError) {
		logger.warn('[Pollar] Deferred wallet activation after KYC failed', activationError)
	}
}
