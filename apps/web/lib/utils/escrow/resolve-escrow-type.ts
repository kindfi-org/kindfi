import type { EscrowType, GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'

const isEscrowType = (value: unknown): value is EscrowType =>
	value === 'single-release' || value === 'multi-release'

export const readEscrowTypeFromMetadata = (metadata: unknown): EscrowType | undefined => {
	if (!metadata || typeof metadata !== 'object') return undefined
	const escrowType = (metadata as { escrow_type?: unknown }).escrow_type
	return isEscrowType(escrowType) ? escrowType : undefined
}

export const inferEscrowTypeFromSaveData = (escrowData: {
	milestones?: Array<{ amount: number; receiver: string }>
	amount?: number
	receiver?: string
}): EscrowType => {
	if (escrowData.milestones && escrowData.milestones.length > 0) {
		return 'multi-release'
	}

	return 'single-release'
}

export const resolveEscrowType = ({
	indexerEscrow,
	projectEscrowType,
	metadataEscrowType,
}: {
	indexerEscrow?: Pick<GetEscrowsFromIndexerResponse, 'type'> | null
	projectEscrowType?: EscrowType
	metadataEscrowType?: EscrowType
}): EscrowType | undefined => {
	if (indexerEscrow?.type) return indexerEscrow.type
	if (projectEscrowType) return projectEscrowType
	if (metadataEscrowType) return metadataEscrowType
	return undefined
}
