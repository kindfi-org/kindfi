import { AppError } from '~/lib/error'
import {
	createEtherfuseOnboardingUrl,
	type EtherfuseApiAuth,
	etherfuseRequest,
	listEtherfuseBankAccounts,
	listEtherfuseWallets,
} from '~/lib/etherfuse/etherfuse-api'
import { isEtherfuseClientNotLinkedError } from '~/lib/etherfuse/order-errors'

type EtherfuseBankAccount = {
	bankAccountId?: string
	id?: string
	customerId?: string
	status?: string
	compliant?: boolean
}

type EtherfuseWalletRecord = {
	walletId?: string
	customerId?: string
	publicKey?: string
}

const EXISTING_ORG_ID_REGEX = /see org:\s*([0-9a-f-]{36})/i

export const parseExistingEtherfuseOrgId = (message: string): string | null => {
	const match = message.match(EXISTING_ORG_ID_REGEX)
	return match?.[1] ?? null
}

const getBankAccountId = (account: EtherfuseBankAccount): string | null =>
	account.bankAccountId ?? account.id ?? null

export const findEtherfuseWalletByPublicKey = async (
	auth: EtherfuseApiAuth,
	publicKey: string,
): Promise<EtherfuseWalletRecord | null> => {
	const wallets = await listEtherfuseWallets(auth)
	return wallets.find((wallet) => wallet.publicKey === publicKey) ?? null
}

export const listEtherfuseCustomerBankAccounts = async (
	auth: EtherfuseApiAuth,
	customerId: string,
): Promise<EtherfuseBankAccount[]> => {
	const data = await etherfuseRequest<{ items?: EtherfuseBankAccount[] }>(
		auth,
		`/ramp/customer/${customerId}/bank-accounts`,
	)
	return data.items ?? []
}

const pickBankAccountId = (
	accounts: EtherfuseBankAccount[],
	preferredBankAccountId?: string,
): string | null => {
	if (preferredBankAccountId) {
		return preferredBankAccountId
	}

	const activeAccount = accounts.find(
		(account) =>
			getBankAccountId(account) &&
			(account.status === 'active' || account.status === undefined) &&
			(account.compliant === true || account.compliant === undefined),
	)
	const fallbackAccount = accounts.find((account) => getBankAccountId(account))

	return (
		getBankAccountId(activeAccount ?? fallbackAccount ?? {}) ?? getBankAccountId(accounts[0] ?? {})
	)
}

export type EtherfuseOnboardingIds = {
	customerId: string
	bankAccountId: string
}

type EtherfuseOrganization = {
	id?: string
}

const getPartnerOrganizationId = async (auth: EtherfuseApiAuth): Promise<string | null> => {
	const data = await etherfuseRequest<EtherfuseOrganization>(auth, '/ramp/me')
	return data.id ?? null
}

export const resolveEtherfuseOnboardingIds = async (
	auth: EtherfuseApiAuth,
	publicKey: string,
	options?: {
		customerId?: string
		bankAccountId?: string
	},
): Promise<EtherfuseOnboardingIds> => {
	let customerId = options?.customerId
	let bankAccountId = options?.bankAccountId

	if (!customerId) {
		const existingWallet = await findEtherfuseWalletByPublicKey(auth, publicKey)
		customerId = existingWallet?.customerId
	}

	if (customerId && !bankAccountId) {
		const customerAccounts = await listEtherfuseCustomerBankAccounts(auth, customerId)
		bankAccountId = pickBankAccountId(customerAccounts) ?? undefined
	}

	if (customerId && !bankAccountId) {
		const orgAccounts = await listEtherfuseBankAccounts(auth)
		bankAccountId =
			pickBankAccountId(orgAccounts.filter((account) => account.customerId === customerId)) ??
			undefined
	}

	const partnerOrganizationId = await getPartnerOrganizationId(auth)
	if (customerId && partnerOrganizationId && customerId === partnerOrganizationId) {
		customerId = undefined
		bankAccountId = undefined
	}

	return {
		customerId: customerId ?? crypto.randomUUID(),
		bankAccountId: bankAccountId ?? crypto.randomUUID(),
	}
}

type EtherfuseOnboardingUserInfo = {
	email?: string
	displayName?: string
}

export type EtherfuseOnboardingUrlResult = {
	presignedUrl: string
	customerId: string
	bankAccountId: string
}

export const requestEtherfuseOnboardingUrl = async (
	auth: EtherfuseApiAuth,
	params: {
		walletAddress: string
		onboardingIds: EtherfuseOnboardingIds
		userInfo?: EtherfuseOnboardingUserInfo
	},
): Promise<EtherfuseOnboardingUrlResult> => {
	const hasUserInfo = Boolean(params.userInfo?.email || params.userInfo?.displayName)

	const createUrl = (ids: EtherfuseOnboardingIds, includeUserInfo: boolean) =>
		createEtherfuseOnboardingUrl(auth, {
			customerId: ids.customerId,
			bankAccountId: ids.bankAccountId,
			publicKey: params.walletAddress,
			userInfo: includeUserInfo ? params.userInfo : undefined,
		})

	const attempt = async (
		ids: EtherfuseOnboardingIds,
		allowOrgRecovery = true,
	): Promise<EtherfuseOnboardingUrlResult> => {
		try {
			return await createUrl(ids, hasUserInfo)
		} catch (error) {
			if (!(error instanceof AppError)) {
				throw error
			}

			let handledError: AppError = error

			if (hasUserInfo && isEtherfuseClientNotLinkedError(error.message)) {
				try {
					return await createUrl(ids, false)
				} catch (retryError) {
					if (
						retryError instanceof AppError &&
						isEtherfuseClientNotLinkedError(retryError.message)
					) {
						throw new AppError(
							'Your email is already linked to a separate Etherfuse account outside KindFi. Complete onboarding in the opened Etherfuse page using a different email, or contact Etherfuse support to link your account to KindFi.',
							409,
						)
					}

					if (!(retryError instanceof AppError)) throw retryError
					handledError = retryError
				}
			}

			const existingOrgId = parseExistingEtherfuseOrgId(handledError.message)
			if (!existingOrgId || !allowOrgRecovery) {
				throw handledError
			}

			const recoveredIds = await resolveEtherfuseOnboardingIds(auth, params.walletAddress, {
				customerId: existingOrgId,
			})

			return attempt(recoveredIds, false)
		}
	}

	return attempt(params.onboardingIds)
}
