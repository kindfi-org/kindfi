import type { AppEnvInterface } from '@packages/lib/types'

/**
 * Get the appropriate RP ID based on the current environment
 * In the browser, uses the current hostname to match WebAuthn requirements
 */
export function getRpId(appConfig: AppEnvInterface, providedRpId?: string): string {
	// If explicitly provided, use it
	if (providedRpId) {
		return providedRpId
	}

	// In the browser, use the current hostname
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname

		// Try to match the current origin with expected origins
		const currentOrigin = window.location.origin
		const expectedOrigins = appConfig.passkey.expectedOrigin
		const rpIds = appConfig.passkey.rpId

		const originIndex = expectedOrigins.indexOf(currentOrigin)

		if (originIndex !== -1 && rpIds[originIndex]) {
			return rpIds[originIndex]
		}

		// If no match found, use the hostname directly (without port)
		// This ensures WebAuthn works correctly in production
		return hostname
	}

	// Server-side: use the first configured RP ID or fallback to localhost
	return appConfig.passkey.rpId[0] || 'localhost'
}

/**
 * Get the appropriate RP Name based on the current environment
 */
export function getRpName(appConfig: AppEnvInterface, providedRpName?: string): string {
	// If explicitly provided, use it
	if (providedRpName) {
		return providedRpName
	}

	// In the browser, try to match with expected origins
	if (typeof window !== 'undefined') {
		const currentOrigin = window.location.origin
		const expectedOrigins = appConfig.passkey.expectedOrigin
		const rpNames = appConfig.passkey.rpName

		const originIndex = expectedOrigins.indexOf(currentOrigin)

		if (originIndex !== -1 && rpNames[originIndex]) {
			return rpNames[originIndex]
		}
	}

	// Fallback to first configured RP name or default
	return appConfig.passkey.rpName[0] || 'App'
}
