import { AppError } from '~/lib/error'
import { logger } from '@/lib/logger'
import type { EtherfuseRampAsset } from '~/lib/etherfuse/types'

export type EtherfuseApiAuth = {
	apiKey: string
	baseUrl: string
}

type PagedResponse<T> = {
	items?: T[]
}

type EtherfuseBankAccount = {
	bankAccountId?: string
	id?: string
	customerId?: string
	status?: string
	compliant?: boolean
}

type EtherfuseWallet = {
	walletId?: string
	publicKey?: string
	customerId?: string
}

export const etherfuseRequest = async <T>(
	{ apiKey, baseUrl }: EtherfuseApiAuth,
	path: string,
	init?: RequestInit,
): Promise<T> => {
	const response = await fetch(`${baseUrl}${path}`, {
		...init,
		headers: {
			Authorization: apiKey,
			'Content-Type': 'application/json',
			...init?.headers,
		},
	})

	if (!response.ok) {
		const errorText = await response.text()
		logger.error('Etherfuse API error', { path, status: response.status, body: errorText })
		throw new AppError(`Etherfuse API error (${path})`, response.status)
	}

	if (response.status === 204) {
		return {} as T
	}

	const text = await response.text()
	return text ? (JSON.parse(text) as T) : ({} as T)
}

const getBankAccountId = (account: EtherfuseBankAccount): string | null =>
	account.bankAccountId ?? account.id ?? null

export const listEtherfuseBankAccounts = async (
	auth: EtherfuseApiAuth,
): Promise<EtherfuseBankAccount[]> => {
	const data = await etherfuseRequest<PagedResponse<EtherfuseBankAccount>>(
		auth,
		'/ramp/bank-accounts',
	)
	return data.items ?? []
}

export const resolveEtherfuseBankAccountId = async (
	auth: EtherfuseApiAuth,
	preferredBankAccountId?: string,
): Promise<string> => {
	if (preferredBankAccountId) {
		return preferredBankAccountId
	}

	const accounts = await listEtherfuseBankAccounts(auth)
	const activeAccount = accounts.find(
		(account) =>
			getBankAccountId(account) &&
			(account.status === 'active' || account.status === undefined) &&
			(account.compliant === true || account.compliant === undefined),
	)
	const fallbackAccount = accounts.find((account) => getBankAccountId(account))

	const bankAccountId =
		getBankAccountId(activeAccount ?? fallbackAccount ?? {}) ?? getBankAccountId(accounts[0] ?? {})

	if (!bankAccountId) {
		throw new AppError(
			'No Etherfuse bank account found. Complete bank setup in the Etherfuse sandbox dashboard or set ETHERFUSE_BANK_ACCOUNT_ID in apps/web/.env.local.',
			500,
		)
	}

	return bankAccountId
}

export const listEtherfuseWallets = async (auth: EtherfuseApiAuth): Promise<EtherfuseWallet[]> => {
	const data = await etherfuseRequest<PagedResponse<EtherfuseWallet>>(auth, '/ramp/wallets')
	return data.items ?? []
}

export const listCustomerWallets = async (
	auth: EtherfuseApiAuth,
	customerId: string,
): Promise<EtherfuseWallet[]> => {
	const data = await etherfuseRequest<PagedResponse<EtherfuseWallet>>(
		auth,
		`/ramp/customer/${customerId}/wallets`,
	)
	return data.items ?? []
}

type EtherfuseKycStatus = {
	status?: string
	needsWork?: boolean
	userMessage?: string | null
}

export const getEtherfuseCustomerKycStatus = async (
	auth: EtherfuseApiAuth,
	customerId: string,
): Promise<EtherfuseKycStatus> =>
	etherfuseRequest<EtherfuseKycStatus>(auth, `/ramp/customer/${customerId}/kyc`)

type EtherfuseWalletDetails = EtherfuseWallet & {
	kycStatus?: string | null
}

export const getEtherfuseWallet = async (
	auth: EtherfuseApiAuth,
	walletId: string,
): Promise<EtherfuseWalletDetails> =>
	etherfuseRequest<EtherfuseWalletDetails>(auth, `/ramp/wallet/${walletId}`)

export const registerEtherfuseWallet = async (
	auth: EtherfuseApiAuth,
	publicKey: string,
): Promise<string> => {
	const walletId = crypto.randomUUID()
	const data = await etherfuseRequest<EtherfuseWallet>(auth, '/ramp/wallet', {
		method: 'POST',
		body: JSON.stringify({
			walletId,
			publicKey,
			blockchain: 'stellar',
			claimOwnership: true,
		}),
	})

	return data.walletId ?? walletId
}

export const resolveEtherfuseWalletReference = async (
	auth: EtherfuseApiAuth,
	publicKey: string,
	preferredWalletId?: string,
): Promise<{ cryptoWalletId?: string; publicKey: string }> => {
	if (preferredWalletId) {
		return { cryptoWalletId: preferredWalletId, publicKey }
	}

	const wallets = await listEtherfuseWallets(auth)
	const existingWallet = wallets.find((wallet) => wallet.publicKey === publicKey)

	if (existingWallet?.walletId) {
		return { cryptoWalletId: existingWallet.walletId, publicKey }
	}

	const registeredWalletId = await registerEtherfuseWallet(auth, publicKey)
	return { cryptoWalletId: registeredWalletId, publicKey }
}

export const resolveCustomerWalletReference = async (
	auth: EtherfuseApiAuth,
	customerId: string,
	publicKey: string,
	preferredWalletId?: string,
): Promise<{ cryptoWalletId: string; publicKey: string; customerId: string }> => {
	if (preferredWalletId) {
		return { cryptoWalletId: preferredWalletId, publicKey, customerId }
	}

	const customerWallets = await listCustomerWallets(auth, customerId)
	const customerWallet = customerWallets.find((wallet) => wallet.publicKey === publicKey)

	if (customerWallet?.walletId) {
		return {
			cryptoWalletId: customerWallet.walletId,
			publicKey,
			customerId: customerWallet.customerId ?? customerId,
		}
	}

	const allWallets = await listEtherfuseWallets(auth)
	const scopedWallet = allWallets.find(
		(wallet) => wallet.publicKey === publicKey && wallet.customerId === customerId,
	)

	if (scopedWallet?.walletId) {
		return {
			cryptoWalletId: scopedWallet.walletId,
			publicKey,
			customerId: scopedWallet.customerId ?? customerId,
		}
	}

	throw new AppError(
		'This wallet is not registered for your Etherfuse customer profile. Complete Etherfuse verification and finish identity, banking, and agreement steps before creating orders.',
		400,
	)
}

type EtherfuseRampAssetsResponse = {
	assets?: EtherfuseRampAsset[]
	items?: EtherfuseRampAsset[]
}

export const listEtherfuseRampAssets = async (
	auth: EtherfuseApiAuth,
	options: { blockchain?: string; currency?: string; wallet: string },
): Promise<EtherfuseRampAsset[]> => {
	const params = new URLSearchParams({
		blockchain: options.blockchain ?? 'stellar',
		wallet: options.wallet,
	})
	if (options.currency) {
		params.set('currency', options.currency.toLowerCase())
	}

	const data = await etherfuseRequest<EtherfuseRampAssetsResponse>(
		auth,
		`/ramp/assets?${params.toString()}`,
	)

	return data.assets ?? data.items ?? []
}

type EtherfuseOnboardingUrlResponse = {
	presignedUrl?: string
	presigned_url?: string
}

export const createEtherfuseOnboardingUrl = async (
	auth: EtherfuseApiAuth,
	payload: {
		customerId: string
		bankAccountId: string
		publicKey: string
		userInfo?: { email?: string; displayName?: string }
	},
): Promise<{ presignedUrl: string; customerId: string; bankAccountId: string }> => {
	const data = await etherfuseRequest<EtherfuseOnboardingUrlResponse>(
		auth,
		'/ramp/onboarding-url',
		{
			method: 'POST',
			body: JSON.stringify({
				customerId: payload.customerId,
				bankAccountId: payload.bankAccountId,
				publicKey: payload.publicKey,
				blockchain: 'stellar',
				...(payload.userInfo ? { userInfo: payload.userInfo } : {}),
			}),
		},
	)

	const presignedUrl = data.presignedUrl ?? data.presigned_url
	if (!presignedUrl) {
		throw new AppError('Etherfuse onboarding URL was not returned', 500)
	}

	return {
		presignedUrl,
		customerId: payload.customerId,
		bankAccountId: payload.bankAccountId,
	}
}
