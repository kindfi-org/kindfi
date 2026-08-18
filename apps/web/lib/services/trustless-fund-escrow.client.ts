import type { EscrowType, FundEscrowPayload } from '@trustless-work/escrow'
import {
	getTrustlessWorkClientBaseUrl,
	getTrustlessWorkNetwork,
} from '~/lib/config/trustless-work.config'
import {
	normalizeTrustlessUnsignedXdr,
	type UnsignedEscrowPayload,
} from '~/lib/utils/escrow/normalize-trustless-unsigned-xdr'
import {
	buildFundEscrowApiPath,
	type EscrowApiVersion,
	resolveFundEscrowApiVersion,
} from '~/lib/utils/escrow/resolve-escrow-api-version'

export type TrustlessFundEscrowResult = {
	status: 'SUCCESS' | 'ERROR'
	unsignedTransaction?: string
	error?: string
}

const isNotFoundResponse = (status: number, body: unknown): boolean => {
	if (status === 404) return true

	if (!body || typeof body !== 'object') return false

	const record = body as { statusCode?: number; message?: string }
	return record.statusCode === 404 || record.message === 'Resource not found'
}

const requestFundEscrowPath = async (
	path: string,
	payload: FundEscrowPayload,
): Promise<
	{ ok: true; unsignedTransaction: string } | { ok: false; status: number; error: string }
> => {
	const response = await fetch(`${getTrustlessWorkClientBaseUrl()}/${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
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

export const fundEscrowViaTrustlessProxy = async (
	payload: FundEscrowPayload,
	escrowType: EscrowType,
	contractApiVersion: EscrowApiVersion,
): Promise<TrustlessFundEscrowResult> => {
	const network = getTrustlessWorkNetwork()
	const primaryApiVersion = resolveFundEscrowApiVersion(network, contractApiVersion)

	const pathsToTry = [buildFundEscrowApiPath(escrowType, primaryApiVersion)]

	if (primaryApiVersion === 'v2') {
		pathsToTry.push(buildFundEscrowApiPath(escrowType, 'v1'))
	}

	let lastError = 'Fund escrow request failed'

	for (const path of pathsToTry) {
		const result = await requestFundEscrowPath(path, payload)

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
