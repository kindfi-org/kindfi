import type {
	CanonicalKycStatus,
	KycAuthorizationResult,
	KycEnforcementMode,
	KycFinancialAction,
	KycReasonCode,
	KycRequiredAction,
} from './types'

export interface KycDenialPayload {
	error: string
	allowed: false
	enforced: boolean
	mode: KycEnforcementMode
	currentKycStatus: CanonicalKycStatus
	policyResult: 'allow' | 'deny'
	reasonCode?: KycReasonCode
	requiredAction?: KycRequiredAction
}

export const isKycDenialPayload = (body: unknown): body is KycDenialPayload => {
	if (!body || typeof body !== 'object') return false
	const value = body as Record<string, unknown>
	return value.allowed === false && typeof value.reasonCode === 'string'
}

export const parseKycDenialResponse = async (
	response: Response,
): Promise<KycDenialPayload | null> => {
	if (response.status !== 403) return null
	const body: unknown = await response.json().catch(() => null)
	return isKycDenialPayload(body) ? body : null
}

export const requestKycAuthorization = async (input: {
	action: KycFinancialAction
	amount?: number
	asset?: string
	network?: string
}): Promise<
	{ allowed: true; result: KycAuthorizationResult } | { allowed: false; denial: KycDenialPayload }
> => {
	const response = await fetch('/api/kyc/authorize', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})

	const body: unknown = await response.json().catch(() => null)

	if (!response.ok) {
		if (isKycDenialPayload(body)) {
			return { allowed: false, denial: body }
		}
		throw new Error(
			body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
				? body.error
				: 'KYC authorization failed',
		)
	}

	return { allowed: true, result: body as KycAuthorizationResult }
}
