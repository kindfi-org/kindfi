import type { EscrowType, FundEscrowPayload } from '@trustless-work/escrow'
import type { EscrowApiVersion } from '~/lib/utils/escrow/resolve-escrow-api-version'

export type TrustlessFundEscrowResult = {
	status: 'SUCCESS' | 'ERROR'
	unsignedTransaction?: string
	error?: string
}

export const fundEscrowViaTrustlessProxy = async (
	payload: FundEscrowPayload,
	escrowType: EscrowType,
	contractApiVersion: EscrowApiVersion,
): Promise<TrustlessFundEscrowResult> => {
	const response = await fetch('/api/escrow/prepare-fund', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			payload,
			escrowType,
			contractApiVersion,
		}),
	})

	const body = (await response.json().catch(() => null)) as {
		status?: string
		unsignedTransaction?: string
		error?: string
		detail?: string
	} | null

	if (!response.ok) {
		const message =
			(body && typeof body.detail === 'string' && body.detail) ||
			(body && typeof body.error === 'string' && body.error) ||
			`Fund escrow request failed (${response.status})`

		return { status: 'ERROR', error: message }
	}

	const unsignedTransaction =
		body && typeof body.unsignedTransaction === 'string' ? body.unsignedTransaction : undefined

	if (!unsignedTransaction) {
		return { status: 'ERROR', error: 'No unsigned transaction returned' }
	}

	return { status: 'SUCCESS', unsignedTransaction }
}
