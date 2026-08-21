import type { WalletSendAssetCode } from '~/lib/wallet-send/types'

const XLM_MAX_DECIMALS = 7
const USDC_MAX_DECIMALS = 7

export type AmountValidationResult = { ok: true; amount: string } | { ok: false; error: string }

const getMaxDecimals = (asset: WalletSendAssetCode): number =>
	asset === 'XLM' ? XLM_MAX_DECIMALS : USDC_MAX_DECIMALS

export const validatePaymentAmount = (
	rawAmount: string,
	asset: WalletSendAssetCode,
): AmountValidationResult => {
	const amount = rawAmount.trim()
	if (!amount) {
		return { ok: false, error: 'Enter an amount to send.' }
	}

	if (!/^\d+(\.\d+)?$/.test(amount)) {
		return { ok: false, error: 'Enter a valid positive amount.' }
	}

	if (amount.startsWith('0') && amount !== '0' && !amount.startsWith('0.')) {
		return { ok: false, error: 'Enter a valid positive amount.' }
	}

	const numeric = Number(amount)
	if (!Number.isFinite(numeric) || numeric <= 0) {
		return { ok: false, error: 'Amount must be greater than zero.' }
	}

	const [, fractional = ''] = amount.split('.')
	if (fractional.length > getMaxDecimals(asset)) {
		return {
			ok: false,
			error: `Amount supports up to ${getMaxDecimals(asset)} decimal places for ${asset}.`,
		}
	}

	return { ok: true, amount }
}

export const compareDecimalAmounts = (left: string, right: string): number => {
	const normalize = (value: string) => {
		const [whole, fraction = ''] = value.split('.')
		return `${whole}.${fraction.padEnd(7, '0')}`.replace(/^0+(?=\d)/, '')
	}

	const normalizedLeft = normalize(left)
	const normalizedRight = normalize(right)
	return normalizedLeft.localeCompare(normalizedRight, undefined, { numeric: true })
}

export const addDecimalAmounts = (left: string, right: string): string => {
	const toStroops = (value: string) => {
		const [whole, fraction = ''] = value.split('.')
		const padded = `${whole}${fraction.padEnd(7, '0').slice(0, 7)}`
		return BigInt(padded)
	}

	const total = toStroops(left) + toStroops(right)
	const whole = total / 10_000_000n
	const fraction = (total % 10_000_000n).toString().padStart(7, '0').replace(/0+$/, '')
	return fraction ? `${whole}.${fraction}` : whole.toString()
}

export const subtractDecimalAmounts = (left: string, right: string): string => {
	const toStroops = (value: string) => {
		const [whole, fraction = ''] = value.split('.')
		const padded = `${whole}${fraction.padEnd(7, '0').slice(0, 7)}`
		return BigInt(padded)
	}

	const total = toStroops(left) - toStroops(right)
	if (total <= 0n) return '0'
	const whole = total / 10_000_000n
	const fraction = (total % 10_000_000n).toString().padStart(7, '0').replace(/0+$/, '')
	return fraction ? `${whole}.${fraction}` : whole.toString()
}
