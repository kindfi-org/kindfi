import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'

/**
 * Get the appropriate RP ID based on the origin
 * Matches the origin with expected origins, or extracts hostname from origin
 */
export function getRpIdFromOrigin(origin: string): string {
	const config: AppEnvInterface = appEnvConfig('web')
	const expectedOrigins = config.passkey.expectedOrigin
	const rpIds = config.passkey.rpId

	// Try to match the origin with expected origins
	const originIndex = expectedOrigins.findIndex(
		(expectedOrigin) => expectedOrigin === origin,
	)

	if (originIndex !== -1 && rpIds[originIndex]) {
		return rpIds[originIndex]
	}

	// If no match found, extract hostname from origin URL
	// This handles production cases where origin might not be in config
	try {
		const url = new URL(origin)
		const hostname = url.hostname

		// Remove 'www.' prefix if present for consistency
		const rpId = hostname.replace(/^www\./, '')

		console.log(
			`⚠️ Origin ${origin} not found in expected origins. Using hostname as RP ID: ${rpId}`,
		)

		return rpId
	} catch {
		// Invalid URL, fall back to first configured RP ID
		console.warn(
			`⚠️ Invalid origin format: ${origin}. Using first configured RP ID.`,
		)
		return rpIds[0] || 'localhost'
	}
}

/**
 * Get the appropriate RP Name based on the origin
 */
export function getRpNameFromOrigin(origin: string): string {
	const config: AppEnvInterface = appEnvConfig('web')
	const expectedOrigins = config.passkey.expectedOrigin
	const rpNames = config.passkey.rpName

	// Try to match the origin with expected origins
	const originIndex = expectedOrigins.findIndex(
		(expectedOrigin) => expectedOrigin === origin,
	)

	if (originIndex !== -1 && rpNames[originIndex]) {
		return rpNames[originIndex]
	}

	// Fall back to first configured RP name or default
	return rpNames[0] || 'KindFi'
}
