import { AppError } from '~/lib/error'
import {
	type EtherfuseApiAuth,
	getEtherfuseCustomerKycStatus,
	getEtherfuseWallet,
	resolveCustomerWalletReference,
	resolveEtherfuseBankAccountId,
} from '~/lib/etherfuse/etherfuse-api'
import type { EtherfuseConfig } from '~/lib/etherfuse/get-etherfuse-config'
import {
	findEtherfuseWalletByPublicKey,
	listEtherfuseCustomerBankAccounts,
	resolveEtherfuseOnboardingIds,
} from '~/lib/etherfuse/resolve-etherfuse-onboarding'

export type EtherfuseOrderContext = {
	customerId: string
	bankAccountId: string
	cryptoWalletId: string
	publicKey: string
}

type EtherfuseOrderOverrides = {
	customerId?: string
	bankAccountId?: string
	cryptoWalletId?: string
}

export const isApprovedEtherfuseKycStatus = (status?: string | null): boolean =>
	status?.toLowerCase() === 'approved'

const isWalletKycReady = (
	walletKycStatus: string | null,
	customerKycApproved: boolean,
): boolean => {
	if (!walletKycStatus) {
		return customerKycApproved
	}

	return isApprovedEtherfuseKycStatus(walletKycStatus)
}

export const resolveEtherfuseOrderContext = async (
	config: EtherfuseConfig,
	walletAddress: string,
	overrides: EtherfuseOrderOverrides = {},
): Promise<EtherfuseOrderContext> => {
	const auth = { apiKey: config.apiKey, baseUrl: config.baseUrl }

	let customerId = overrides.customerId
	if (!customerId) {
		const existingWallet = await findEtherfuseWalletByPublicKey(auth, walletAddress)
		if (!existingWallet?.customerId) {
			throw new AppError(
				'No Etherfuse profile found for this wallet. Complete Etherfuse verification first.',
				404,
			)
		}
		customerId = existingWallet.customerId
	}

	const bankAccountId = overrides.bankAccountId
		? overrides.bankAccountId
		: overrides.customerId
			? await resolveEtherfuseBankAccountId(auth, config.bankAccountId || undefined)
			: (await resolveEtherfuseOnboardingIds(auth, walletAddress, { customerId })).bankAccountId

	const walletReference = await resolveCustomerWalletReference(
		auth,
		customerId,
		walletAddress,
		overrides.cryptoWalletId ?? (config.cryptoWalletId || undefined),
	)

	return {
		customerId: walletReference.customerId,
		bankAccountId,
		cryptoWalletId: walletReference.cryptoWalletId,
		publicKey: walletReference.publicKey,
	}
}

export type EtherfuseOnboardingStatus = {
	customerId: string
	kycStatus: string | null
	walletKycStatus: string | null
	bankAccountCompliant: boolean
	bankAccountStatus: string | null
	needsSecondaryVerification: boolean
	pendingSteps: string[]
	isReady: boolean
	userMessage: string | null
	/** Bank verified in API but customer/wallet KYC never started — hosted UI can still say "complete". */
	hostUiMismatch: boolean
}

const buildPendingSteps = (params: {
	kycStatus: string | null
	walletKycStatus: string | null
	bankAccountCompliant: boolean
	hasBankAccount: boolean
}): string[] => {
	const steps: string[] = []

	if (!params.hasBankAccount) {
		steps.push('banking')
	} else if (!params.bankAccountCompliant) {
		steps.push('secondary_verification')
	}

	if (!isApprovedEtherfuseKycStatus(params.kycStatus)) {
		if (params.kycStatus === 'proposed') {
			steps.push('kyc_review')
		} else {
			steps.push('identity_and_agreements')
		}
	}

	if (params.walletKycStatus && !isApprovedEtherfuseKycStatus(params.walletKycStatus)) {
		steps.push('wallet_verification')
	}

	return steps
}

export const computeEtherfuseOnboardingSnapshot = (params: {
	kycStatus: string | null
	walletKycStatus: string | null
	bankAccountCompliant: boolean
	hasBankAccount: boolean
}) => {
	const pendingSteps = buildPendingSteps(params)
	const customerKycApproved = isApprovedEtherfuseKycStatus(params.kycStatus)
	const hostUiMismatch =
		params.bankAccountCompliant &&
		params.hasBankAccount &&
		(params.kycStatus === 'not_started' || params.walletKycStatus === 'not_started')
	const isReady =
		pendingSteps.length === 0 &&
		customerKycApproved &&
		isWalletKycReady(params.walletKycStatus, customerKycApproved) &&
		params.bankAccountCompliant

	return {
		pendingSteps,
		isReady,
		hostUiMismatch,
		needsSecondaryVerification: pendingSteps.includes('secondary_verification'),
	}
}

export const getEtherfuseOnboardingStatus = async (
	auth: EtherfuseApiAuth,
	params: {
		customerId: string
		bankAccountId: string
		walletAddress: string
	},
): Promise<EtherfuseOnboardingStatus> => {
	const [kyc, walletReference, bankAccounts] = await Promise.all([
		getEtherfuseCustomerKycStatus(auth, params.customerId),
		resolveCustomerWalletReference(auth, params.customerId, params.walletAddress),
		listEtherfuseCustomerBankAccounts(auth, params.customerId),
	])

	const walletDetails = await getEtherfuseWallet(auth, walletReference.cryptoWalletId)
	const bankAccount = bankAccounts.find(
		(account) => (account.bankAccountId ?? account.id) === params.bankAccountId,
	)
	const bankAccountCompliant = bankAccount?.compliant === true
	const bankAccountStatus = bankAccount?.status ?? null

	const kycStatus = kyc.status ?? null
	const walletKycStatus = walletDetails.kycStatus ?? null
	const pendingSteps = buildPendingSteps({
		kycStatus,
		walletKycStatus,
		bankAccountCompliant,
		hasBankAccount: Boolean(bankAccount),
	})
	const snapshot = computeEtherfuseOnboardingSnapshot({
		kycStatus,
		walletKycStatus,
		bankAccountCompliant,
		hasBankAccount: Boolean(bankAccount),
	})

	return {
		customerId: params.customerId,
		kycStatus,
		walletKycStatus,
		bankAccountCompliant,
		bankAccountStatus,
		needsSecondaryVerification: snapshot.needsSecondaryVerification,
		pendingSteps,
		isReady: snapshot.isReady,
		userMessage: kyc.userMessage ?? null,
		hostUiMismatch: snapshot.hostUiMismatch,
	}
}
