import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import {
	ACTIVE_DIDIT_SESSION_STATUSES,
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

const DIDIT_SESSION_COLUMNS =
	'id, user_id, kyc_review_id, session_id, verification_url, didit_status, canonical_status, last_provider_event_id, last_provider_event_at'

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
		.select(DIDIT_SESSION_COLUMNS)
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
		.select(DIDIT_SESSION_COLUMNS)
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
		.select(DIDIT_SESSION_COLUMNS)
		.eq('user_id', userId)
		.in('canonical_status', ACTIVE_DIDIT_SESSION_STATUSES)
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

export const resolveKycStatus = (params: {
	sessionStatus: CanonicalKycStatus | null
	reviewStatus: KycDbStatus | null
}): CanonicalKycStatus => {
	if (
		params.sessionStatus === 'approved' ||
		canonicalFromDbStatus(params.reviewStatus) === 'approved'
	) {
		return 'approved'
	}

	return params.sessionStatus ?? canonicalFromDbStatus(params.reviewStatus)
}

export const hasAnyApprovedSessionForUser = async (userId: string): Promise<boolean> => {
	const { data, error } = await getKycSchemaClient()
		.from('didit_sessions')
		.select('id')
		.eq('user_id', userId)
		.eq('canonical_status', 'approved')
		.limit(1)
		.maybeSingle()

	if (error) {
		logger.error('[kyc] Failed to check for approved sessions', {
			error: error.message,
		})
		return false
	}

	return data !== null
}

export const getCanonicalKycStatusForUser = async (userId: string): Promise<CanonicalKycStatus> => {
	const session = await findLatestDiditSessionForUser(userId)
	if (session?.canonicalStatus === 'approved') {
		return 'approved'
	}

	/**
	 * Guard: if any older session is approved, preserve that status even
	 * when the newest session is non-approved (e.g. a new verification
	 * attempt still in progress). A newer non-approved session must not
	 * downgrade a previously approved user.
	 */
	if (await hasAnyApprovedSessionForUser(userId)) {
		return 'approved'
	}

	const review = await findLatestKycReview(userId)

	return resolveKycStatus({
		sessionStatus: session?.canonicalStatus ?? null,
		reviewStatus: review?.status ?? null,
	})
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
		.select(DIDIT_SESSION_COLUMNS)
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

export interface PendingPollarWalletActivation {
	userId: string
	walletAddress: string
}

export interface PollarWalletActivationResult {
	userId: string
	activated: boolean
	reason?: 'not_pending' | 'activation_failed'
	error?: string
}

/**
 * A Pollar wallet address without an activation timestamp is the persisted
 * "activation pending" state: `pollar_wallet_activated_at` is only written once
 * Pollar confirms activation, so a failed attempt leaves this state behind and it
 * can be retried later — no webhook replay or status transition required.
 */
export const findPendingPollarWalletActivations = async (
	limit = 25,
): Promise<PendingPollarWalletActivation[]> => {
	const { data, error } = await supabaseServiceRole
		.from('profiles')
		.select('id, pollar_wallet_address')
		.not('pollar_wallet_address', 'is', null)
		.is('pollar_wallet_activated_at', null)
		.order('updated_at', { ascending: false })
		.limit(limit)

	if (error) {
		logger.error('[Pollar] Failed to load pending wallet activations', { error: error.message })
		return []
	}

	const rows = (data ?? []) as Array<{ id: string; pollar_wallet_address: string | null }>

	return rows
		.filter((row) => Boolean(row.pollar_wallet_address))
		.map((row) => ({
			userId: row.id,
			walletAddress: row.pollar_wallet_address as string,
		}))
}

type PollarActivationReadState =
	| { status: 'pending' }
	| { status: 'not_pending' }
	| { status: 'read_error'; error: string }

/**
 * Reads the persisted activation state, keeping a failed read distinct from a
 * successful read that says "not pending". `retryPollarWalletActivation` needs
 * that distinction: treating a read failure as "not pending" reports a spurious
 * success and leaves the wallet unactivated for good.
 */
const readPollarWalletActivationState = async (
	userId: string,
): Promise<PollarActivationReadState> => {
	const { data, error } = await supabaseServiceRole
		.from('profiles')
		.select('id, pollar_wallet_address, pollar_wallet_activated_at')
		.eq('id', userId)
		.maybeSingle()

	if (error) {
		logger.error('[Pollar] Failed to read wallet activation state', { error: error.message })
		return { status: 'read_error', error: error.message }
	}

	if (!data) return { status: 'not_pending' }
	const pending = Boolean(data.pollar_wallet_address) && !data.pollar_wallet_activated_at
	return { status: pending ? 'pending' : 'not_pending' }
}

export const isPollarWalletActivationPending = async (userId: string): Promise<boolean> => {
	const state = await readPollarWalletActivationState(userId)
	return state.status === 'pending'
}

/**
 * Retries a deferred Pollar wallet activation and reports the outcome instead of
 * swallowing it, so a retry job or a later status read can observe the failure and
 * try again. Never throws: a failed activation must not invalidate the approved
 * KYC status, which is already persisted and never rolled back here.
 */
export const retryPollarWalletActivation = async (
	userId: string,
): Promise<PollarWalletActivationResult> => {
	const pendingState = await readPollarWalletActivationState(userId)
	if (pendingState.status === 'read_error') {
		// A failed read is not evidence that activation completed. Report it as a
		// failure so the retry job observes it and tries again, instead of claiming
		// success and leaving the wallet unactivated indefinitely.
		return {
			userId,
			activated: false,
			reason: 'activation_failed',
			error: pendingState.error,
		}
	}
	if (pendingState.status === 'not_pending') {
		return { userId, activated: true, reason: 'not_pending' }
	}

	try {
		const { activatePollarWalletForProfile } = await import('~/lib/pollar/bridge/link-pollar-user')
		await activatePollarWalletForProfile(userId)
		return { userId, activated: true }
	} catch (activationError) {
		return {
			userId,
			activated: false,
			reason: 'activation_failed',
			error:
				activationError instanceof Error
					? activationError.message
					: 'Unknown Pollar activation error',
		}
	}
}

/**
 * Job entry point: sweeps pending Pollar wallet activations and retries each one.
 * Safe to run repeatedly — profiles activated by another path are skipped.
 */
export const runPollarWalletActivationRetryJob = async (
	limit = 25,
): Promise<{ attempted: number; activated: number; failed: number }> => {
	const pending = await findPendingPollarWalletActivations(limit)
	let activated = 0
	let failed = 0

	for (const entry of pending) {
		const result = await retryPollarWalletActivation(entry.userId)
		if (result.activated) {
			activated += 1
		} else {
			failed += 1
		}
	}

	return { attempted: pending.length, activated, failed }
}

export const activatePollarIfApproved = async (
	userId: string,
	canonicalStatus: CanonicalKycStatus,
): Promise<void> => {
	if (canonicalStatus !== 'approved') return

	// A failure here is recoverable, not fatal: the profile keeps its pending
	// activation state so the retry job or the wallet-activate endpoint can finish
	// the activation without another webhook or status transition.
	const result = await retryPollarWalletActivation(userId)
	if (!result.activated) {
		logger.warn('[Pollar] Deferred wallet activation after KYC failed', {
			userId,
			error: result.error,
		})
	}
}
