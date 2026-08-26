'use server'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { revalidatePath } from 'next/cache'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import { hasValidPersonalInfo, isSelectableRole } from '~/lib/onboarding/state'
import { updateOnboardingPersonalInfoInputSchema } from '~/lib/schemas/onboarding.schemas'

const logger = new Logger()

export type UpdateOnboardingPersonalInfoResult =
	| { success: true; onboardingCompletedAt: string | null }
	| { success: false; error: string; fieldErrors?: Record<string, string[]> }

/**
 * Persists required onboarding personal info (display name, bio) for the
 * authenticated user only. Resolves user id from the session — never trusts
 * a client-supplied id. Completes onboarding atomically once role + display
 * name + bio are all valid.
 */
export async function updateOnboardingPersonalInfoAction(input: {
	displayName: string
	bio: string
}): Promise<UpdateOnboardingPersonalInfoResult> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('updateOnboardingPersonalInfo')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	const parseResult = updateOnboardingPersonalInfoInputSchema.safeParse(input)
	if (!parseResult.success) {
		const fieldErrors: Record<string, string[]> = {}
		for (const issue of parseResult.error.issues) {
			const key = issue.path.join('.') || 'form'
			fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
		}
		return { success: false, error: 'Please fix the highlighted fields.', fieldErrors }
	}
	const validated = parseResult.data

	try {
		await enforceRateLimit(session.user.id, 'update_onboarding_personal_info')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	const userId = session.user.id

	const { data: existingProfile, error: fetchError } = await supabaseServiceRole
		.from('profiles')
		.select('role, onboarding_completed_at')
		.eq('id', userId)
		.single()

	if (fetchError || !existingProfile) {
		logger.error({
			eventType: 'UPDATE_ONBOARDING_PERSONAL_INFO_PROFILE_NOT_FOUND',
			userId,
			error: fetchError?.message ?? 'Profile not found',
		})
		return { success: false, error: 'Profile not found' }
	}

	if (!isSelectableRole(existingProfile.role) && existingProfile.role !== 'admin') {
		return {
			success: false,
			error: 'Please select whether you are joining as a donor or creator first.',
		}
	}

	const isNowComplete = hasValidPersonalInfo(validated.displayName, validated.bio)
	const nowIso = new Date().toISOString()

	const { error: updateError } = await supabaseServiceRole
		.from('profiles')
		.update({
			display_name: validated.displayName,
			bio: validated.bio,
			onboarding_step: isNowComplete ? 'completed' : 'personal_info',
			onboarding_completed_at: isNowComplete
				? (existingProfile.onboarding_completed_at ?? nowIso)
				: existingProfile.onboarding_completed_at,
			updated_at: nowIso,
		})
		.eq('id', userId)

	if (updateError) {
		logger.error({
			eventType: 'UPDATE_ONBOARDING_PERSONAL_INFO_UPDATE_FAILED',
			userId,
			error: updateError.message,
		})
		return { success: false, error: 'Failed to save your info. Please try again.' }
	}

	logger.info({
		eventType: 'ONBOARDING_PERSONAL_INFO_SAVED',
		userId,
		completed: isNowComplete,
	})

	revalidatePath('/onboarding')
	revalidatePath('/profile')

	return {
		success: true,
		onboardingCompletedAt: isNowComplete
			? (existingProfile.onboarding_completed_at ?? nowIso)
			: null,
	}
}
