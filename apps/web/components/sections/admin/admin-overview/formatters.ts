export const formatCurrency = (value: number, options?: { maxFractionDigits?: number }) =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: options?.maxFractionDigits ?? 0,
	}).format(value)

export const formatPercent = (value: number, fractionDigits = 1) =>
	new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value / 100)
