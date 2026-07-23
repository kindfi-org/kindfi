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
import { updateProfileRoleInputSchema } from '~/lib/schemas/server-actions.schemas'

const logger = new Logger()

export type UpdateProfileRoleResult =
	| { success: true; role: 'creator' | 'donor' }
	| { success: false; error: string }

export async function updateProfileRoleAction(input: {
	role: 'creator' | 'donor'
}): Promise<UpdateProfileRoleResult> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('updateProfileRole')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	let validated: ReturnType<typeof updateProfileRoleInputSchema.parse>
	try {
		validated = validateInput(updateProfileRoleInputSchema, input, 'updateProfileRole')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid role selection')
		return { success: false, error: failure.error }
	}

	try {
		await enforceRateLimit(session.user.id, 'update_profile_role')
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
			eventType: 'UPDATE_PROFILE_ROLE_PROFILE_NOT_FOUND',
			userId,
			error: fetchError?.message ?? 'Profile not found',
		})
		return { success: false, error: 'Profile not found' }
	}

	if (existingProfile.role === 'admin') {
		return { success: false, error: 'Admin roles cannot be changed through this action' }
	}

	const { error: updateError } = await supabaseServiceRole
		.from('profiles')
		.update({
			role: validated.role,
			updated_at: new Date().toISOString(),
		})
		.eq('id', userId)

	if (updateError) {
		logger.error({
			eventType: 'UPDATE_PROFILE_ROLE_UPDATE_FAILED',
			userId,
			error: updateError.message,
		})
		return { success: false, error: 'Failed to save your role. Please try again.' }
	}

	revalidatePath('/profile')

	return { success: true, role: validated.role }
}
