export function parseDonationError(
	error: unknown,
	tokenAddress?: string,
): string {
	let errorMessage = ''
	let apiErrorMessage = ''

	if (error instanceof Error) {
		errorMessage = error.message
	} else if (typeof error === 'object' && error !== null) {
		if ('response' in error && error.response) {
			const response = error.response as {
				data?: { message?: string; error?: string }
			}
			if (response.data?.message) {
				apiErrorMessage = response.data.message
			} else if (response.data?.error) {
				apiErrorMessage = response.data.error
			}
		}
		errorMessage = String(error)
	} else {
		errorMessage = String(error)
	}

	const combinedMessage = `${errorMessage} ${apiErrorMessage}`.toLowerCase()

	let userFriendlyMessage =
		"We couldn't process your donation. Please try again."

	if (
		combinedMessage.includes('storage, missingvalue') ||
		combinedMessage.includes('missingvalue') ||
		(combinedMessage.includes('balance') &&
			combinedMessage.includes('non-existing'))
	) {
		if (tokenAddress) {
			userFriendlyMessage = `Your wallet needs to establish a trustline for the token (${tokenAddress.slice(0, 8)}...) before donating. Please ensure your wallet has approved this token contract.`
		} else {
			userFriendlyMessage =
				'Your wallet needs to establish a trustline for the token before donating. Please ensure your wallet has approved the token contract.'
		}
	} else if (
		combinedMessage.includes('insufficient funds') ||
		combinedMessage.includes('sufficient funds')
	) {
		userFriendlyMessage =
			'Insufficient funds. Please ensure your wallet has enough token balance.'
	} else if (combinedMessage.includes('trustline')) {
		userFriendlyMessage =
			'Trustline required. Your wallet needs to establish a trustline for the token before donating.'
	} else if (apiErrorMessage) {
		userFriendlyMessage = apiErrorMessage
	}

	return userFriendlyMessage
}
