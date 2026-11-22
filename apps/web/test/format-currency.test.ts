import { describe, expect, test } from 'bun:test'
import { formatCurrencyAmount, normalizeFractionDigits } from '~/lib/utils/format-currency'

describe('normalizeFractionDigits', () => {
	test('clamps minimum when it exceeds maximum', () => {
		expect(normalizeFractionDigits(2, 0, 2)).toEqual({
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
	})

	test('clamps values to Intl valid range', () => {
		expect(normalizeFractionDigits(-1, 25, 0)).toEqual({
			minimumFractionDigits: 0,
			maximumFractionDigits: 20,
		})
	})

	test('handles NaN options', () => {
		expect(normalizeFractionDigits(Number.NaN, Number.NaN, 2)).toEqual({
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	})
})

describe('formatCurrencyAmount', () => {
	test('formats escrow card amounts with max 0 and escrow default min 2', () => {
		expect(
			formatCurrencyAmount(1234.56, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 0,
			}),
		).toBe('$1,235')
	})

	test('returns placeholder for null amounts', () => {
		expect(formatCurrencyAmount(null)).toBe('…')
	})

	test('returns placeholder for non-finite amounts', () => {
		expect(formatCurrencyAmount(Number.NaN)).toBe('—')
	})

	test('coerces numeric strings', () => {
		expect(formatCurrencyAmount('1234.5', { maximumFractionDigits: 0 })).toBe('$1,235')
	})

	test('never throws for invalid fraction-digit combinations', () => {
		expect(() =>
			formatCurrencyAmount(100, {
				minimumFractionDigits: 7,
				maximumFractionDigits: 2,
			}),
		).not.toThrow()
	})

	test('formats amounts with token code like USDC and XLM', () => {
		expect(
			formatCurrencyAmount(1234.56, {
				code: 'USDC',
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			}),
		).toBe('1,234.56 USDC')

		expect(
			formatCurrencyAmount(500, {
				code: 'USDC',
				maximumFractionDigits: 0,
			}),
		).toBe('500 USDC')

		expect(
			formatCurrencyAmount(12.345, {
				code: 'XLM',
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			}),
		).toBe('12.35 XLM')
	})

	test('handles currency option set to USDC without throwing', () => {
		expect(
			formatCurrencyAmount(1000, {
				currency: 'USDC',
				maximumFractionDigits: 0,
			}),
		).toBe('1,000 USDC')
	})
})
