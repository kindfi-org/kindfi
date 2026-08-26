import type { User } from 'next-auth'

/** True when the signed-in user onboarded via Pollar (custodial wallet). */
export const isPollarOnboardedUser = (user: User): boolean => {
	const extended = user as User & { onboardingProvider?: string }
	return extended.onboardingProvider === 'pollar' || user.userData?.onboarding_provider === 'pollar'
}
