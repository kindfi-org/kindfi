'use server'

import { revalidatePath } from 'next/cache'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { isValidIsoAlpha2 } from '~/lib/compliance/countries'
import { setDeclaredCountry } from '~/lib/compliance/country-declaration-service'
import { updateDeclaredCountryInputSchema } from '~/lib/schemas/server-actions.schemas'

export type UpdateDeclaredCountryResult =
	| { success: true; countryCode: string }
	| { success: false; error: string }

/**
 * Minimal onboarding/profile touchpoint for issue #1009's mandatory
 * "current country of residence" requirement.
 *
 * The dedicated onboarding flow from issue #1006 (PR #1015) is not merged
 * into `develop` yet and has no country-of-residence step, so this action is
 * the interim collection point — surfaced from the profile personal-info
 * card. Once #1006 lands, its onboarding step should call
 * `setDeclaredCountry` directly (or this action) instead of duplicating the
 * write path.
 */
export async function updateDeclaredCountryAction(input: {
	countryCode: string
}): Promise<UpdateDeclaredCountryResult> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('updateDeclaredCountry')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	let validated: ReturnType<typeof updateDeclaredCountryInputSchema.parse>
	try {
		validated = validateInput(updateDeclaredCountryInputSchema, input, 'updateDeclaredCountry')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid country selection')
		return { success: false, error: failure.error }
	}

	if (!isValidIsoAlpha2(validated.countryCode)) {
		return { success: false, error: 'Unrecognized country code.' }
	}

	try {
		await enforceRateLimit(session.user.id, 'update_declared_country')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	const result = await setDeclaredCountry(session.user.id, validated.countryCode)
	if (!result.success) {
		return { success: false, error: result.error }
	}

	revalidatePath('/profile')

	return { success: true, countryCode: result.profile.declaredCountry ?? validated.countryCode }
}
