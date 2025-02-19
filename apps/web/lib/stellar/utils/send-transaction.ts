import { http } from '~/lib/axios/http'
import type { SendTransactionResponse } from '~/lib/types/escrow/escrow-response.types'

export async function sendTransaction(
	signedXdr: string,
): Promise<SendTransactionResponse> {
	try {
		const response = await http.post<SendTransactionResponse>(
			'/helper/send-transaction',
			{
				signedXdr,
				returnValueIsRequired: true,
			},
		)
		return response.data
	} catch (error) {
		console.error('Error sending transaction:', error)
		throw error
	}
}
