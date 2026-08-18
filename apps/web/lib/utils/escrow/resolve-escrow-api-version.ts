import type { EscrowType } from '@trustless-work/escrow'

export type EscrowApiVersion = 'v1' | 'v2'

export const readEscrowApiVersionFromMetadata = (
	metadata: unknown,
): EscrowApiVersion | undefined => {
	if (!metadata || typeof metadata !== 'object') return undefined

	const version = (metadata as { escrow_api_version?: unknown }).escrow_api_version
	if (version === 'v2') return 'v2'
	if (version === 'v1') return 'v1'

	return undefined
}

export const resolveEscrowApiVersion = ({
	metadataVersion,
	detectedVersion,
}: {
	metadataVersion?: EscrowApiVersion
	detectedVersion?: EscrowApiVersion
}): EscrowApiVersion => metadataVersion ?? detectedVersion ?? 'v1'

export const buildFundEscrowApiPath = (
	escrowType: EscrowType,
	apiVersion: EscrowApiVersion,
): string => {
	if (apiVersion === 'v2') {
		return `/escrow/${escrowType}/v2/fund`
	}

	return `/escrow/${escrowType}/fund-escrow`
}

export const buildReadEscrowApiPath = (
	escrowType: EscrowType,
	apiVersion: EscrowApiVersion,
	contractId: string,
): string => {
	if (apiVersion === 'v2') {
		return `/escrow/${escrowType}/v2/${contractId}`
	}

	return `/escrow/${escrowType}/${contractId}`
}
