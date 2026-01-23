// lib/services/didit.ts

import * as crypto from 'crypto'

const DIDIT_API_BASE_URL = 'https://verification.didit.me'

interface CreateSessionRequest {
	workflow_id: string
	vendor_data?: string
	callback?: string
	callback_method?: 'initiator' | 'completer' | 'both'
	metadata?: string
	language?: string
	contact_details?: {
		email?: string
		send_notification_emails?: boolean
		email_lang?: string
		phone?: string
	}
	expected_details?: Record<string, unknown>
	portrait_image?: string
}

interface CreateSessionResponse {
	session_id: string
	session_number: number
	session_token: string
	vendor_data?: string
	metadata?: Record<string, unknown>
	status: string
	workflow_id: string
	callback?: string
	url: string
}

interface SessionStatusResponse {
	session_id: string
	status:
		| 'Not Started'
		| 'In Progress'
		| 'Approved'
		| 'Declined'
		| 'In Review'
		| 'Abandoned'
	created_at: string
	updated_at?: string
}

/**
 * Create a Didit verification session
 */
export async function createDiditSession(
	email: string,
	callbackUrl?: string,
	metadata?: Record<string, unknown>,
): Promise<CreateSessionResponse> {
	const apiKey = process.env.DIDIT_API_KEY
	const workflowId = process.env.DIDIT_WORKFLOW_ID

	if (!apiKey) {
		throw new Error('DIDIT_API_KEY is not configured')
	}

	if (!workflowId) {
		throw new Error('DIDIT_WORKFLOW_ID is not configured')
	}

	const requestBody: CreateSessionRequest = {
		workflow_id: workflowId,
		vendor_data: metadata?.userId as string | undefined,
		...(callbackUrl && { callback: callbackUrl }),
		callback_method: 'both', // Allow either device to trigger callback
		...(metadata && { metadata: JSON.stringify(metadata) }),
		contact_details: {
			email,
			send_notification_emails: false,
		},
	}

	const response = await fetch(`${DIDIT_API_BASE_URL}/v3/session/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify(requestBody),
	})

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ detail: 'Unknown error' }))
		const errorMessage =
			errorData.detail || errorData.message || response.statusText
		throw new Error(`Failed to create Didit session: ${errorMessage}`)
	}

	return response.json()
}

/**
 * Retrieve session status from Didit
 */
export async function getDiditSessionStatus(
	sessionId: string,
): Promise<SessionStatusResponse> {
	const apiKey = process.env.DIDIT_API_KEY

	if (!apiKey) {
		throw new Error('DIDIT_API_KEY is not configured')
	}

	const response = await fetch(
		`${DIDIT_API_BASE_URL}/v3/session/${sessionId}/decision/`,
		{
			method: 'GET',
			headers: {
				'x-api-key': apiKey,
			},
		},
	)

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ detail: 'Unknown error' }))
		const errorMessage = error.detail || error.message || response.statusText
		throw new Error(`Failed to get Didit session status: ${errorMessage}`)
	}

	return response.json()
}

/**
 * Process floats to match server-side behavior.
 * Converts float values that are whole numbers to integers.
 */
function shortenFloats(data: unknown): unknown {
	if (Array.isArray(data)) {
		return data.map(shortenFloats)
	}
	if (data !== null && typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [key, shortenFloats(value)]),
		)
	}
	if (typeof data === 'number' && !Number.isInteger(data) && data % 1 === 0) {
		return Math.trunc(data)
	}
	return data
}

/**
 * Sort object keys recursively
 */
function sortKeysRecursive(data: unknown): unknown {
	if (Array.isArray(data)) {
		return data.map(sortKeysRecursive)
	}
	if (data !== null && typeof data === 'object') {
		const sorted = Object.keys(data)
			.sort()
			.reduce(
				(result, key) => {
					result[key] = sortKeysRecursive(
						(data as Record<string, unknown>)[key],
					)
					return result
				},
				{} as Record<string, unknown>,
			)
		return sorted
	}
	return data
}

/**
 * Verify X-Signature-V2 (Recommended)
 * Works even if middleware re-encodes special characters.
 * Uses unescaped Unicode JSON - matches default JSON.stringify behavior.
 */
export function verifyDiditWebhookSignatureV2(
	jsonBody: Record<string, unknown>,
	signatureHeader: string,
	timestampHeader: string,
	secretKey: string,
): boolean {
	try {
		// Check timestamp freshness (within 5 minutes)
		const currentTime = Math.floor(Date.now() / 1000)
		const incomingTime = Number.parseInt(timestampHeader, 10)
		if (Math.abs(currentTime - incomingTime) > 300) {
			return false
		}

		// Process floats and create sorted JSON with unescaped Unicode
		const processedData = shortenFloats(jsonBody)
		const sortedData = sortKeysRecursive(processedData)

		// JSON.stringify keeps Unicode as-is (e.g., "José" stays as "José")
		const canonicalJson = JSON.stringify(sortedData)

		const hmac = crypto.createHmac('sha256', secretKey)
		const expectedSignature = hmac.update(canonicalJson, 'utf8').digest('hex')

		return crypto.timingSafeEqual(
			Buffer.from(expectedSignature, 'utf8'),
			Buffer.from(signatureHeader, 'utf8'),
		)
	} catch {
		return false
	}
}

/**
 * Verify X-Signature-Simple (Fallback)
 * Independent of JSON encoding - verifies core fields only.
 */
export function verifyDiditWebhookSignatureSimple(
	jsonBody: Record<string, unknown>,
	signatureHeader: string,
	timestampHeader: string,
	secretKey: string,
): boolean {
	try {
		// Check timestamp freshness (within 5 minutes)
		const currentTime = Math.floor(Date.now() / 1000)
		const incomingTime = Number.parseInt(timestampHeader, 10)
		if (Math.abs(currentTime - incomingTime) > 300) {
			return false
		}

		// Build canonical string from core fields
		const canonicalString = [
			jsonBody.timestamp || '',
			jsonBody.session_id || '',
			jsonBody.status || '',
			jsonBody.webhook_type || '',
		].join(':')

		const hmac = crypto.createHmac('sha256', secretKey)
		const expectedSignature = hmac.update(canonicalString).digest('hex')

		return crypto.timingSafeEqual(
			Buffer.from(expectedSignature, 'utf8'),
			Buffer.from(signatureHeader, 'utf8'),
		)
	} catch {
		return false
	}
}

/**
 * Verify webhook signature using HMAC (legacy method for raw body)
 */
export function verifyDiditWebhookSignature(
	payload: string,
	signature: string,
	secret: string,
): boolean {
	try {
		const expectedSignature = crypto
			.createHmac('sha256', secret)
			.update(payload)
			.digest('hex')

		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature),
		)
	} catch {
		return false
	}
}
