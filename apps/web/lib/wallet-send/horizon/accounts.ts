import type { Horizon } from '@stellar/stellar-sdk'
import type { HorizonAccountResponse } from '~/lib/wallet-send/types'

export class WalletSendHorizonError extends Error {
	constructor(
		message: string,
		readonly code: 'account_not_found' | 'network_error' | 'unknown',
	) {
		super(message)
		this.name = 'WalletSendHorizonError'
	}
}

export const loadHorizonAccount = async (
	server: Horizon.Server,
	address: string,
): Promise<HorizonAccountResponse> => {
	try {
		const account = await server.loadAccount(address)
		return account as unknown as HorizonAccountResponse
	} catch (error) {
		const notFound =
			typeof error === 'object' &&
			error !== null &&
			'response' in error &&
			typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
			(error as { response?: { status?: number } }).response?.status === 404

		if (notFound) {
			throw new WalletSendHorizonError(
				'Destination account not found on this network.',
				'account_not_found',
			)
		}

		throw new WalletSendHorizonError(
			'Unable to load account details from Horizon. Check your network connection and try again.',
			'network_error',
		)
	}
}
