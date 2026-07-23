/**
 * Track onboarding path selection for rollout analytics.
 */
export const trackOnboardingPath = (
	path: 'pollar' | 'legacy_passkey',
	event: 'signup_started' | 'signup_completed' | 'donation_completed',
) => {
	if (typeof window === 'undefined') return

	const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
	if (!gaId) return

	// gtag is injected by Next.js / GA when configured
	const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
	if (!gtag) return

	gtag('event', event, {
		onboarding_path: path,
		event_category: 'onboarding',
	})
}
