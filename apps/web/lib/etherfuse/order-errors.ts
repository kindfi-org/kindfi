export const isEtherfuseTermsError = (message: string): boolean =>
	message.toLowerCase().includes('terms and conditions')

export const isEtherfuseClientNotLinkedError = (message: string): boolean =>
	message.toLowerCase().includes('client not linked to this organization')
