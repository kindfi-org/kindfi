/**
 * Get Stellar Explorer URL for a contract
 * @param contractId - The contract ID/address
 * @param network - Optional network override ('testnet' | 'mainnet'). If not provided, uses environment detection
 * @returns The Stellar Explorer URL
 */
export function getStellarExplorerUrl(
	contractId: string,
	network?: 'testnet' | 'mainnet',
): string {
	if (!contractId) return ''

	// Determine network if not provided
	let explorerNetwork: 'testnet' | 'public' = 'testnet'
	if (!network) {
		const isProduction =
			process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
			process.env.NODE_ENV === 'production'
		explorerNetwork = isProduction ? 'public' : 'testnet'
	} else {
		explorerNetwork = network === 'mainnet' ? 'public' : 'testnet'
	}

	return `https://stellar.expert/explorer/${explorerNetwork}/contract/${contractId}`
}

/**
 * Get Stellar Explorer URL for an account address (contract or regular account)
 * @param address - The account/contract address
 * @param network - Optional network override ('testnet' | 'mainnet'). If not provided, uses environment detection
 * @returns The Stellar Explorer URL
 */
export function getStellarExplorerAccountUrl(
	address: string,
	network?: 'testnet' | 'mainnet',
): string {
	if (!address) return ''

	// Determine network if not provided
	let explorerNetwork: 'testnet' | 'public' = 'testnet'
	if (!network) {
		const isProduction =
			process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
			process.env.NODE_ENV === 'production'
		explorerNetwork = isProduction ? 'public' : 'testnet'
	} else {
		explorerNetwork = network === 'mainnet' ? 'public' : 'testnet'
	}

	// User addresses are contract addresses, so use contract endpoint
	return `https://stellar.expert/explorer/${explorerNetwork}/contract/${address}`
}
