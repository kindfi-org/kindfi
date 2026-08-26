import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'

export const resolveValidatedEscrowData = (
	response: GetEscrowsFromIndexerResponse | GetEscrowsFromIndexerResponse[],
): GetEscrowsFromIndexerResponse => {
	if (Array.isArray(response)) {
		if (response.length === 0) {
			throw new Error('No escrow found for this contract ID')
		}
		return response[0]
	}

	return response
}
