import { appEnvConfig } from '@packages/lib/config'

// Use the centralized configuration
const appConfig = appEnvConfig('kyc-server')

// Export passkey configuration for backward compatibility
export const ENV_PASSKEY = {
	REDIS_URL: appConfig.passkey.redis.url,
	RP_ID: appConfig.passkey.rpId,
	RP_NAME: appConfig.passkey.rpName,
	EXPECTED_ORIGIN: appConfig.passkey.expectedOrigin,
	CHALLENGE_TTL_SECONDS: appConfig.passkey.challengeTtlSeconds,
	CHALLENGE_TTL_MS: appConfig.passkey.challengeTtlMs,
}
