import {
	type ClientStellarNetworkId,
	getClientStellarNetworkId,
	getClientStellarNetworkPassphrase,
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import { getDefaultUsdcContractAddress } from '~/lib/constants/escrow'

const USDC_ISSUER_G_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/

export const WALLET_TRANSFER_HORIZON_URLS: Record<ClientStellarNetworkId, string> = {
	mainnet: 'https://horizon.stellar.org',
	testnet: 'https://horizon-testnet.stellar.org',
}

export type WalletTransferConfig = {
	networkId: ClientStellarNetworkId
	networkPassphrase: string
	horizonUrl: string
	usdc: { code: 'USDC'; issuer: string }
	explorerNetwork: ClientStellarNetworkId
}

export type WalletTransferConfigError = {
	ok: false
	error: string
}

export type WalletTransferConfigResult =
	| { ok: true; config: WalletTransferConfig }
	| WalletTransferConfigError

const isPassphraseConsistent = (networkId: ClientStellarNetworkId, passphrase: string): boolean => {
	if (networkId === 'mainnet') {
		return passphrase === STELLAR_MAINNET_PASSPHRASE
	}

	return passphrase === STELLAR_TESTNET_PASSPHRASE
}

const isHorizonUrlConsistent = (networkId: ClientStellarNetworkId, horizonUrl: string): boolean => {
	return horizonUrl === WALLET_TRANSFER_HORIZON_URLS[networkId]
}

export const getWalletTransferConfig = (): WalletTransferConfigResult => {
	const networkId = getClientStellarNetworkId()
	const networkPassphrase = getClientStellarNetworkPassphrase()
	const horizonUrl = WALLET_TRANSFER_HORIZON_URLS[networkId]
	const usdcIssuer = getDefaultUsdcContractAddress().trim()

	if (!usdcIssuer) {
		return { ok: false, error: 'USDC issuer is not configured for the active network.' }
	}

	if (!USDC_ISSUER_G_ADDRESS_REGEX.test(usdcIssuer)) {
		return {
			ok: false,
			error: 'USDC issuer must be a valid Stellar G-address for classic payments.',
		}
	}

	if (!isPassphraseConsistent(networkId, networkPassphrase)) {
		return {
			ok: false,
			error: 'Stellar network passphrase does not match the configured wallet network.',
		}
	}

	if (!isHorizonUrlConsistent(networkId, horizonUrl)) {
		return {
			ok: false,
			error: 'Horizon URL does not match the configured wallet network.',
		}
	}

	return {
		ok: true,
		config: {
			networkId,
			networkPassphrase,
			horizonUrl,
			usdc: { code: 'USDC', issuer: usdcIssuer },
			explorerNetwork: networkId,
		},
	}
}

export const requireWalletTransferConfig = (): WalletTransferConfig => {
	const result = getWalletTransferConfig()
	if (!result.ok) {
		throw new Error(result.error)
	}

	return result.config
}
