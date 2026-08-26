'use server'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'

const logger = new Logger()

export type CompleteProductTourResult =
	| { success: true; productTourCompletedAt: string }
	| { success: false; error: string }

/**
 * Marks the optional guided product tour as completed (or explicitly
 * skipped) for the authenticated user. DB-persisted so clearing local
 * storage never restarts a completed tour.
 */
export async function completeProductTourAction(): Promise<CompleteProductTourResult> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('completeProductTour')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	try {
		await enforceRateLimit(session.user.id, 'complete_product_tour')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	const userId = session.user.id
	const nowIso = new Date().toISOString()

	const { error } = await supabaseServiceRole
		.from('profiles')
		.update({ product_tour_completed_at: nowIso, updated_at: nowIso })
		.eq('id', userId)

	if (error) {
		logger.error({ eventType: 'COMPLETE_PRODUCT_TOUR_FAILED', userId, error: error.message })
		return { success: false, error: 'Failed to save tour progress.' }
	}

	logger.info({ eventType: 'PRODUCT_TOUR_COMPLETED', userId })

	return { success: true, productTourCompletedAt: nowIso }
}
