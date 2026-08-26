'use server'

import { requireAuthenticatedSession, toServerActionFailure } from '~/lib/auth/server-action-auth'
import { getCountryProfile } from '~/lib/compliance/country-declaration-service'

export type GetDeclaredCountryResult =
	| { success: true; countryCode: string | null }
	| { success: false; error: string }

export async function getDeclaredCountryAction(): Promise<GetDeclaredCountryResult> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('getDeclaredCountry')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	const profile = await getCountryProfile(session.user.id)
	return { success: true, countryCode: profile?.declaredCountry ?? null }
}
