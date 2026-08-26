'use server'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { revalidatePath } from 'next/cache'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import { selectOnboardingRoleInputSchema } from '~/lib/schemas/onboarding.schemas'

const logger = new Logger()

export type SelectOnboardingRoleResult =
	| { success: true; role: 'donor' | 'creator' }
	| { success: false; error: string }

/**
 * Persists the user's initial onboarding role. Only a `pending` profile may
 * transition to `donor` or `creator` — this action is intentionally NOT
 * reusable for donor/creator role switching after onboarding; that would be
 * a separate, future settings workflow.
 */
export async function selectOnboardingRoleAction(input: {
	role: 'donor' | 'creator'
}): Promise<SelectOnboardingRoleResult> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('selectOnboardingRole')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	let validated: ReturnType<typeof selectOnboardingRoleInputSchema.parse>
	try {
		validated = validateInput(selectOnboardingRoleInputSchema, input, 'selectOnboardingRole')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid role selection')
		return { success: false, error: failure.error }
	}

	try {
		await enforceRateLimit(session.user.id, 'select_onboarding_role')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	const userId = session.user.id

	const { data: existingProfile, error: fetchError } = await supabaseServiceRole
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.single()

	if (fetchError || !existingProfile) {
		logger.error({
			eventType: 'SELECT_ONBOARDING_ROLE_PROFILE_NOT_FOUND',
			userId,
			error: fetchError?.message ?? 'Profile not found',
		})
		return { success: false, error: 'Profile not found' }
	}

	if (existingProfile.role !== 'pending' && existingProfile.role !== null) {
		return {
			success: false,
			error: 'Your role has already been set and cannot be changed from onboarding.',
		}
	}

	const { error: updateError } = await supabaseServiceRole
		.from('profiles')
		.update({
			role: validated.role,
			onboarding_step: 'personal_info',
			updated_at: new Date().toISOString(),
		})
		.eq('id', userId)

	if (updateError) {
		logger.error({
			eventType: 'SELECT_ONBOARDING_ROLE_UPDATE_FAILED',
			userId,
			error: updateError.message,
		})
		return { success: false, error: 'Failed to save your role. Please try again.' }
	}

	logger.info({ eventType: 'ONBOARDING_ROLE_SELECTED', userId, role: validated.role })

	revalidatePath('/onboarding')

	return { success: true, role: validated.role }
}
