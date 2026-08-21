import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import type {
	HorizonAccountBalanceLine,
	HorizonAccountResponse,
	WalletSendAssetCode,
} from '~/lib/wallet-send/types'
import {
	addDecimalAmounts,
	compareDecimalAmounts,
	subtractDecimalAmounts,
} from '~/lib/wallet-send/validation/amount'

const BASE_RESERVE_XLM = '0.5'

const multiplyDecimalByInt = (value: string, multiplier: number): string => {
	if (multiplier <= 0) return '0'
	let result = '0'
	for (let index = 0; index < multiplier; index += 1) {
		result = addDecimalAmounts(result, value)
	}
	return result
}

export type WalletAssetBalance = {
	available: string
	total: string
}

const findNativeBalance = (
	account: HorizonAccountResponse,
): HorizonAccountBalanceLine | undefined =>
	account.balances.find((line) => line.asset_type === 'native')

const findUsdcBalance = (
	account: HorizonAccountResponse,
	issuer: string,
): HorizonAccountBalanceLine | undefined =>
	account.balances.find(
		(line) =>
			line.asset_type !== 'native' && line.asset_code === 'USDC' && line.asset_issuer === issuer,
	)

export const getXlmSpendableBalance = (account: HorizonAccountResponse): WalletAssetBalance => {
	const native = findNativeBalance(account)
	const total = native?.balance ?? '0'
	const sellingLiabilities = native?.selling_liabilities ?? '0'
	const minimumReserve = multiplyDecimalByInt(BASE_RESERVE_XLM, 2 + Number(account.subentry_count))

	let available = subtractDecimalAmounts(total, minimumReserve)
	available = subtractDecimalAmounts(available, sellingLiabilities)
	if (compareDecimalAmounts(available, '0') <= 0) {
		available = '0'
	}

	return { available, total }
}

export const getUsdcBalance = (
	account: HorizonAccountResponse,
	config: WalletTransferConfig,
): WalletAssetBalance => {
	const usdc = findUsdcBalance(account, config.usdc.issuer)
	const total = usdc?.balance ?? '0'
	const sellingLiabilities = usdc?.selling_liabilities ?? '0'
	let available = subtractDecimalAmounts(total, sellingLiabilities)
	if (compareDecimalAmounts(available, '0') <= 0) {
		available = '0'
	}

	return { available, total }
}

export const getWalletBalances = (
	account: HorizonAccountResponse,
	config: WalletTransferConfig,
): Record<WalletSendAssetCode, WalletAssetBalance> => ({
	XLM: getXlmSpendableBalance(account),
	USDC: getUsdcBalance(account, config),
})

export const assertUsdcTrustlineReady = (
	account: HorizonAccountResponse,
	config: WalletTransferConfig,
	amount: string,
): { ok: true } | { ok: false; error: string } => {
	const line = findUsdcBalance(account, config.usdc.issuer)
	if (!line) {
		return {
			ok: false,
			error: 'Your wallet does not have a USDC trustline on this network.',
		}
	}

	if (line.is_authorized === false) {
		return {
			ok: false,
			error: 'Your USDC trustline is not authorized.',
		}
	}

	const available = getUsdcBalance(account, config).available
	if (compareDecimalAmounts(available, amount) < 0) {
		return { ok: false, error: 'Insufficient USDC balance for this transfer.' }
	}

	return { ok: true }
}

export const assertDestinationUsdcTrustline = (
	account: HorizonAccountResponse,
	config: WalletTransferConfig,
	amount: string,
): { ok: true } | { ok: false; error: string } => {
	const line = findUsdcBalance(account, config.usdc.issuer)
	if (!line) {
		return {
			ok: false,
			error: 'The destination account does not have the configured USDC trustline.',
		}
	}

	if (line.is_authorized === false) {
		return {
			ok: false,
			error: 'The destination USDC trustline is not authorized.',
		}
	}

	const limit = line.limit ?? '922337203685.4775807'
	const balance = line.balance ?? '0'
	const remaining = subtractDecimalAmounts(limit, balance)
	if (compareDecimalAmounts(remaining, amount) < 0) {
		return {
			ok: false,
			error: 'The destination USDC trustline does not have enough remaining limit.',
		}
	}

	return { ok: true }
}

export const assertXlmSpendable = (
	account: HorizonAccountResponse,
	amount: string,
	estimatedFeeXlm = '0.00001',
): { ok: true } | { ok: false; error: string } => {
	const spendable = getXlmSpendableBalance(account).available
	const required = addDecimalAmounts(amount, estimatedFeeXlm)
	if (compareDecimalAmounts(spendable, required) < 0) {
		return {
			ok: false,
			error: 'Insufficient spendable XLM after reserves, liabilities, and network fees.',
		}
	}

	return { ok: true }
}

export const assertFeeReserve = (
	account: HorizonAccountResponse,
	estimatedFeeXlm = '0.00001',
): { ok: true } | { ok: false; error: string } => {
	const spendable = getXlmSpendableBalance(account).available
	if (compareDecimalAmounts(spendable, estimatedFeeXlm) < 0) {
		return {
			ok: false,
			error: 'Insufficient XLM available to pay network fees.',
		}
	}

	return { ok: true }
}
