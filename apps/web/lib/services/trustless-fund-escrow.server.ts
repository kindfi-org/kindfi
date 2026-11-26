import type { EscrowType, FundEscrowPayload } from '@trustless-work/escrow'
import {
	getTrustlessWorkApiKey,
	getTrustlessWorkNetwork,
	getTrustlessWorkUpstreamApiBaseUrl,
} from '~/lib/config/trustless-work.config'
import type { TrustlessFundEscrowResult } from '~/lib/services/trustless-fund-escrow.client'
import {
	normalizeTrustlessUnsignedXdr,
	type UnsignedEscrowPayload,
} from '~/lib/utils/escrow/normalize-trustless-unsigned-xdr'
import {
	buildFundEscrowApiPath,
	type EscrowApiVersion,
	resolveFundEscrowApiVersion,
} from '~/lib/utils/escrow/resolve-escrow-api-version'

const isNotFoundResponse = (status: number, message: string): boolean => {
	if (status === 404) return true

	const normalized = message.toLowerCase()
	return normalized.includes('resource not found') || normalized.includes('escrow not found')
}

const requestFundEscrowPath = async (
	path: string,
	payload: FundEscrowPayload,
	apiKey: string,
): Promise<
	{ ok: true; unsignedTransaction: string } | { ok: false; status: number; error: string }
> => {
	const upstreamBase = getTrustlessWorkUpstreamApiBaseUrl(path.replace(/^\//, ''))
	const response = await fetch(`${upstreamBase}${path}`, {
		method: 'POST',
		headers: {
			'x-api-key': apiKey,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
		cache: 'no-store',
	})

	const body = (await response.json().catch(() => null)) as
		| UnsignedEscrowPayload
		| { message?: string; detail?: string; error?: string; statusCode?: number }
		| null

	if (!response.ok) {
		const message =
			(body && 'detail' in body && typeof body.detail === 'string' && body.detail) ||
			(body && 'message' in body && typeof body.message === 'string' && body.message) ||
			(body && 'error' in body && typeof body.error === 'string' && body.error) ||
			`Fund escrow request failed (${response.status})`

		return { ok: false, status: response.status, error: message }
	}

	const unsignedTransaction = normalizeTrustlessUnsignedXdr(
		body && ('unsignedXdr' in body || 'unsignedTransaction' in body) ? body : {},
	)
	if (!unsignedTransaction) {
		return { ok: false, status: response.status, error: 'No unsigned transaction returned' }
	}

	return { ok: true, unsignedTransaction }
}

export const fundEscrowViaTrustlessWorkServer = async (
	payload: FundEscrowPayload,
	escrowType: EscrowType,
	contractApiVersion: EscrowApiVersion,
): Promise<TrustlessFundEscrowResult> => {
	const apiKey = getTrustlessWorkApiKey()
	if (!apiKey) {
		return { status: 'ERROR', error: 'Trustless Work API key is not configured on the server' }
	}

	const network = getTrustlessWorkNetwork()
	const primaryApiVersion = resolveFundEscrowApiVersion(network, contractApiVersion)

	const pathsToTry = [buildFundEscrowApiPath(escrowType, primaryApiVersion)]

	if (primaryApiVersion === 'v2') {
		pathsToTry.push(buildFundEscrowApiPath(escrowType, 'v1'))
	}

	let lastError = 'Fund escrow request failed'

	for (const path of pathsToTry) {
		const result = await requestFundEscrowPath(path, payload, apiKey)

		if (result.ok) {
			return { status: 'SUCCESS', unsignedTransaction: result.unsignedTransaction }
		}

		lastError = result.error

		if (!isNotFoundResponse(result.status, result.error)) {
			return { status: 'ERROR', error: result.error }
		}
	}

	return { status: 'ERROR', error: lastError }
}
