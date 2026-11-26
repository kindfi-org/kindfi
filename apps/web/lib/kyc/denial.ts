import { NextResponse } from 'next/server'
import { authorizeFinancialAction } from './authorization-service'
import type { AuthorizeFinancialActionInput, KycAuthorizationResult } from './types'

export const toKycDenialPayload = (result: KycAuthorizationResult) => ({
	error: 'Identity verification is required for this action.',
	allowed: result.allowed,
	enforced: result.enforced,
	mode: result.mode,
	currentKycStatus: result.currentKycStatus,
	policyResult: result.policyResult,
	reasonCode: result.reasonCode,
	requiredAction: result.requiredAction,
})

export const kycForbiddenResponse = (result: KycAuthorizationResult) =>
	NextResponse.json(toKycDenialPayload(result), { status: 403 })

export const requireKycAuthorization = async (
	input: AuthorizeFinancialActionInput,
): Promise<
	{ ok: true; result: KycAuthorizationResult } | { ok: false; response: NextResponse }
> => {
	const result = await authorizeFinancialAction(input)
	if (!result.allowed) {
		return { ok: false, response: kycForbiddenResponse(result) }
	}
	return { ok: true, result }
}

export const isKycDenialPayload = (
	body: unknown,
): body is ReturnType<typeof toKycDenialPayload> => {
	if (!body || typeof body !== 'object') return false
	const value = body as Record<string, unknown>
	return value.allowed === false && typeof value.reasonCode === 'string'
}
