import { ENV } from '~/lib/passkey/env'

// Use the centralized passkey ENV configuration
export const KYC_API_BASE_URL =
	process.env.KYC_API_BASE_URL || 'http://localhost:3001'

// Export other passkey-related configurations from the centralized ENV
export const PASSKEY_CONFIG = {
	RP_ID: ENV.RP_ID,
	RP_NAME: ENV.RP_NAME,
	EXPECTED_ORIGIN: ENV.EXPECTED_ORIGIN,
	CHALLENGE_TTL_MS: ENV.CHALLENGE_TTL_MS,
} as const
