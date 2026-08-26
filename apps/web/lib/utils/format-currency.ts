const MAX_FRACTION_DIGITS = 20

export type FormatCurrencyOptions = {
	currency?: string
	locale?: string
	loadingPlaceholder?: string
	minimumFractionDigits?: number
	maximumFractionDigits?: number
}

/** Coerce API / DB values to a finite number without throwing. */
export const coerceNumericAmount = (amount: unknown): number | null => {
	if (amount === null || amount === undefined) {
		return null
	}

	if (typeof amount === 'number') {
		return Number.isFinite(amount) ? amount : null
	}

	if (typeof amount === 'bigint') {
		const numeric = Number(amount)
		return Number.isFinite(numeric) ? numeric : null
	}

	if (typeof amount === 'string' && amount.trim() !== '') {
		const numeric = Number(amount)
		return Number.isFinite(numeric) ? numeric : null
	}

	return null
}

const clampFractionDigits = (value: number | undefined, fallback: number): number => {
	if (value === undefined || !Number.isFinite(value)) {
		return fallback
	}

	return Math.min(MAX_FRACTION_DIGITS, Math.max(0, Math.trunc(value)))
}

/** Normalize Intl fraction-digit options so min <= max and both stay within 0–20. */
export const normalizeFractionDigits = (
	minimumFractionDigits?: number,
	maximumFractionDigits?: number,
	defaultFractionDigits = 0,
): { minimumFractionDigits: number; maximumFractionDigits: number } => {
	const maximum = clampFractionDigits(maximumFractionDigits, defaultFractionDigits)
	const minimum = clampFractionDigits(minimumFractionDigits, maximum)

	return {
		minimumFractionDigits: Math.min(minimum, maximum),
		maximumFractionDigits: maximum,
	}
}

/**
 * Safe USD/currency formatter for UI. Never throws on invalid fraction-digit options.
 */
export const formatCurrencyAmount = (
	amount: number | null | undefined,
	options?: FormatCurrencyOptions,
): string => {
	const numericAmount = coerceNumericAmount(amount)

	if (numericAmount === null) {
		return options?.loadingPlaceholder ?? (amount === null || amount === undefined ? '…' : '—')
	}

	const { minimumFractionDigits, maximumFractionDigits } = normalizeFractionDigits(
		options?.minimumFractionDigits,
		options?.maximumFractionDigits,
	)

	try {
		return new Intl.NumberFormat(options?.locale ?? 'en-US', {
			style: 'currency',
			currency: options?.currency ?? 'USD',
			minimumFractionDigits,
			maximumFractionDigits,
		}).format(numericAmount)
	} catch {
		const fallbackDigits = Math.min(maximumFractionDigits, 2)
		return `$${numericAmount.toFixed(fallbackDigits)}`
	}
}
