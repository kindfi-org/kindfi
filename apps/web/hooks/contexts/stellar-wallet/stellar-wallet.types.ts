export interface WalletContextValue {
	address: string | null
	walletName: string | null
	isConnected: boolean
	isInitialized: boolean
	connect: () => Promise<void>
	disconnect: () => void
	signTransaction: (unsignedXdr: string) => Promise<string>
}

export const WALLET_ADDRESS_KEY = 'stellar_wallet_address'
export const WALLET_NAME_KEY = 'stellar_wallet_name'

export const WALLET_ID_TO_NAME: Record<string, string> = {
	freighter: 'Freighter',
	albedo: 'Albedo',
	rabet: 'Rabet',
	xbull: 'xBull',
	walletconnect: 'WalletConnect',
}
