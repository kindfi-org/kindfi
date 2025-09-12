import { logger } from '~/lib'
import { httpEscrow } from '~/lib/axios/http'
import type { SendTransactionResponse } from '~/lib/types/escrow/escrow-response.types'

export async function sendTransaction(
	signedXdr: string,
): Promise<SendTransactionResponse> {
	try {
		const response = await httpEscrow.post<SendTransactionResponse>(
			'/helper/send-transaction',
			{
				signedXdr,
				returnValueIsRequired: true,
			},
		)
		return response.data
	} catch (error) {
		logger.error({
			eventType: 'Send Transaction Error',
			error: error instanceof Error ? error.message : 'Unknown error',
			details: error,
		})
		throw error
	}
}
