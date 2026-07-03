import { formatCurrencyAmount, normalizeFractionDigits } from '~/lib/utils/format-currency'

export const formatCurrency = (value: number, options?: { maxFractionDigits?: number }) =>
	formatCurrencyAmount(value, {
		minimumFractionDigits: 0,
		maximumFractionDigits: options?.maxFractionDigits ?? 0,
	})

export const formatPercent = (value: number, fractionDigits = 1) => {
	const { minimumFractionDigits, maximumFractionDigits } = normalizeFractionDigits(
		fractionDigits,
		fractionDigits,
		1,
	)

	return new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits,
		maximumFractionDigits,
	}).format(value / 100)
}
