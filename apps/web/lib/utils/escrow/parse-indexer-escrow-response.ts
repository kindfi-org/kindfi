import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'

export const parseIndexerEscrowResponse = (
	response: GetEscrowsFromIndexerResponse | GetEscrowsFromIndexerResponse[],
): GetEscrowsFromIndexerResponse | null => {
	if (Array.isArray(response)) {
		return response[0] ?? null
	}

	return response ?? null
}
