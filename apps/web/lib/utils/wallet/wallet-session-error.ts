export const WALLET_SESSION_EXPIRED_MESSAGE =
	'Wallet session expired. Disconnect and reconnect your Stellar wallet (Freighter), then try again.'

const readErrorMessage = (error: unknown): string | undefined => {
	if (typeof error === 'string' && error.trim().length > 0) {
		return error
	}

	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message
	}

	if (typeof error === 'object' && error !== null && 'message' in error) {
		const message = (error as { message?: unknown }).message
		if (typeof message === 'string' && message.trim().length > 0) {
			return message
		}
	}

	return undefined
}

export const isStaleWalletSessionError = (error: unknown): boolean => {
	const message = readErrorMessage(error)?.toLowerCase() ?? ''
	return message.includes('connection key is missing')
}

export const getWalletSessionErrorMessage = (error: unknown): string | undefined => {
	if (isStaleWalletSessionError(error)) {
		return WALLET_SESSION_EXPIRED_MESSAGE
	}

	return readErrorMessage(error)
}
