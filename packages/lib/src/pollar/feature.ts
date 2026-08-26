import { appEnvConfig } from '../config'

const POLLAR_DISABLED_MESSAGE =
	'Pollar onboarding is disabled. Set NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING=true to enable.'

/**
 * Returns whether Pollar social/email wallet onboarding is enabled.
 */
export const isPollarOnboardingEnabled = (): boolean =>
	appEnvConfig('web').features.enablePollarOnboarding

/**
 * Throws when Pollar onboarding is disabled.
 */
export const assertPollarOnboardingEnabled = (): void => {
	if (!isPollarOnboardingEnabled()) {
		throw new Error(POLLAR_DISABLED_MESSAGE)
	}
}

export const POLLAR_FEATURE_FLAG = 'NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING' as const
