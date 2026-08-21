import {
	BIO_MAX,
	BIO_MIN,
	DISPLAY_NAME_MAX,
	DISPLAY_NAME_MIN,
} from '~/lib/schemas/onboarding.schemas'
import type { OnboardingProfileFields, OnboardingState, ProfileRole } from './types'

export function isSelectableRole(role: ProfileRole | null): role is 'donor' | 'creator' {
	return role === 'donor' || role === 'creator'
}

export function hasValidPersonalInfo(displayName: string | null, bio: string | null): boolean {
	const trimmedName = (displayName ?? '').trim()
	const trimmedBio = (bio ?? '').trim()
	return (
		trimmedName.length >= DISPLAY_NAME_MIN &&
		trimmedName.length <= DISPLAY_NAME_MAX &&
		trimmedBio.length >= BIO_MIN &&
		trimmedBio.length <= BIO_MAX
	)
}

/**
 * Derives onboarding completion/step from the DB-persisted profile fields.
 * The DB is the source of truth: completion always requires a valid role,
 * display name, and bio, regardless of the stored `onboarding_step` value.
 */
export function computeOnboardingState(profile: OnboardingProfileFields): OnboardingState {
	const hasRole = isSelectableRole(profile.role) || profile.role === 'admin'
	const hasPersonalInfo = hasValidPersonalInfo(profile.displayName, profile.bio)
	const isComplete = Boolean(profile.onboardingCompletedAt) && hasRole && hasPersonalInfo

	if (isComplete) {
		return { isComplete: true, step: 'completed', hasRole, hasPersonalInfo }
	}

	if (!hasRole) {
		return { isComplete: false, step: 'role', hasRole, hasPersonalInfo }
	}

	if (!hasPersonalInfo) {
		return { isComplete: false, step: 'personal_info', hasRole, hasPersonalInfo }
	}

	return { isComplete: false, step: 'confirm', hasRole, hasPersonalInfo }
}
