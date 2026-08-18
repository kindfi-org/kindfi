import type { EscrowType, FundEscrowPayload } from '@trustless-work/escrow'
import { getTrustlessWorkClientBaseUrl } from '~/lib/config/trustless-work.config'
import {
	normalizeTrustlessUnsignedXdr,
	type UnsignedEscrowPayload,
} from '~/lib/utils/escrow/normalize-trustless-unsigned-xdr'
import {
	buildFundEscrowApiPath,
	type EscrowApiVersion,
} from '~/lib/utils/escrow/resolve-escrow-api-version'

export type TrustlessFundEscrowResult = {
	status: 'SUCCESS' | 'ERROR'
	unsignedTransaction?: string
	error?: string
}

export const fundEscrowViaTrustlessProxy = async (
	payload: FundEscrowPayload,
	escrowType: EscrowType,
	apiVersion: EscrowApiVersion,
): Promise<TrustlessFundEscrowResult> => {
	const path = buildFundEscrowApiPath(escrowType, apiVersion)
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
		| { message?: string; detail?: string; error?: string }
		| null

	if (!response.ok) {
		const message =
			(body && 'detail' in body && typeof body.detail === 'string' && body.detail) ||
			(body && 'message' in body && typeof body.message === 'string' && body.message) ||
			(body && 'error' in body && typeof body.error === 'string' && body.error) ||
			`Fund escrow request failed (${response.status})`

		return { status: 'ERROR', error: message }
	}

	const unsignedTransaction = normalizeTrustlessUnsignedXdr(
		body && ('unsignedXdr' in body || 'unsignedTransaction' in body) ? body : {},
	)
	if (!unsignedTransaction) {
		return { status: 'ERROR', error: 'No unsigned transaction returned' }
	}

	return { status: 'SUCCESS', unsignedTransaction }
}
