import { appEnvConfig } from '@packages/lib/config'
import { Resend } from 'resend'

let resendClient: Resend | null = null

/**
 * Returns a Resend client (singleton created on first use).
 * - Avoids strict env validation at import time to prevent boot-time errors.
 * - Validates API key right before sending emails.
 * - Reuses a single instance across calls.
 */
export function getResendClient(): Resend {
	if (resendClient) return resendClient

	// Read env without app-level strict validation to avoid startup failures.
	const env = appEnvConfig()

	// Guard clause: require API key at the moment of use.
	const apiKey = env.resend?.apiKey
	if (!apiKey) {
		throw new Error('RESEND_SMTP_API_KEY is required to send emails.')
	}

	// Initialize once and reuse.
	resendClient = new Resend(apiKey)
	return resendClient
}
