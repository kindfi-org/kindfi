import { describe, expect, test } from 'bun:test'
import {
	compareDecimalAmounts,
	subtractDecimalAmounts,
	validatePaymentAmount,
} from '~/lib/wallet-send/validation/amount'
import { validatePaymentDestination } from '~/lib/wallet-send/validation/destination'
import { validatePaymentMemo } from '~/lib/wallet-send/validation/memo'

const SOURCE = 'GBBO453X3XUPUCSEYSLRDA7S4YPUJ7S3NDKCB3W7V3J4K3QY533IQZUE'
const DESTINATION = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

describe('validatePaymentDestination', () => {
	test('accepts valid G-address destinations', () => {
		const result = validatePaymentDestination(DESTINATION, SOURCE)
		expect(result.ok).toBe(true)
	})

	test('rejects C-address destinations', () => {
		const result = validatePaymentDestination('CEScrow12345678901234567890123456789012', SOURCE)
		expect(result.ok).toBe(false)
	})

	test('rejects self-send', () => {
		const result = validatePaymentDestination(SOURCE, SOURCE)
		expect(result.ok).toBe(false)
	})
})

describe('validatePaymentMemo', () => {
	test('accepts empty memo', () => {
		const result = validatePaymentMemo({ type: 'none' })
		expect(result.ok).toBe(true)
	})

	test('rejects oversized text memo', () => {
		const result = validatePaymentMemo({ type: 'text', value: 'a'.repeat(29) })
		expect(result.ok).toBe(false)
	})

	test('accepts numeric memo id', () => {
		const result = validatePaymentMemo({ type: 'id', value: '123456789' })
		expect(result.ok).toBe(true)
	})
})

describe('validatePaymentAmount', () => {
	test('accepts valid XLM amount', () => {
		const result = validatePaymentAmount('10.5', 'XLM')
		expect(result).toEqual({ ok: true, amount: '10.5' })
	})

	test('rejects zero amount', () => {
		const result = validatePaymentAmount('0', 'XLM')
		expect(result.ok).toBe(false)
	})

	test('rejects too many decimal places', () => {
		const result = validatePaymentAmount('1.12345678', 'USDC')
		expect(result.ok).toBe(false)
	})
})

describe('decimal helpers', () => {
	test('subtracts decimal amounts without floating point drift', () => {
		expect(subtractDecimalAmounts('10.0000001', '10')).toBe('0.0000001')
	})

	test('compares decimal amounts', () => {
		expect(compareDecimalAmounts('2', '10')).toBeLessThan(0)
		expect(compareDecimalAmounts('10', '10')).toBe(0)
	})
})
