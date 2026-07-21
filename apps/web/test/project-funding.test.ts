import { describe, expect, test } from 'bun:test'
import {
	calculateFundingProgressPercent,
	resolveDisplayRaisedAmount,
} from '~/lib/utils/projects/project-funding'

describe('resolveDisplayRaisedAmount', () => {
	test('returns DB raised when project has no escrow', () => {
		expect(
			resolveDisplayRaisedAmount({
				dbRaised: 250,
			}),
		).toBe(250)
	})

	test('returns null while escrow balance is loading', () => {
		expect(
			resolveDisplayRaisedAmount({
				dbRaised: 100,
				escrowContractAddress: 'CEScrow12345678901234567890123456789012',
				isLoadingEscrowBalance: true,
			}),
		).toBeNull()
	})

	test('prefers on-chain escrow balance when available', () => {
		expect(
			resolveDisplayRaisedAmount({
				dbRaised: 100,
				escrowContractAddress: 'CEScrow12345678901234567890123456789012',
				escrowBalance: 425.5,
			}),
		).toBe(425.5)
	})

	test('falls back to DB raised when on-chain balance is unavailable', () => {
		expect(
			resolveDisplayRaisedAmount({
				dbRaised: 180,
				escrowContractAddress: 'CEScrow12345678901234567890123456789012',
			}),
		).toBe(180)
	})

	test('uses on-chain zero balance when escrow is empty', () => {
		expect(
			resolveDisplayRaisedAmount({
				dbRaised: 500,
				escrowContractAddress: 'CEScrow12345678901234567890123456789012',
				escrowBalance: 0,
			}),
		).toBe(0)
	})
})

describe('calculateFundingProgressPercent', () => {
	test('computes percentage of goal, rounded and clamped to 100', () => {
		expect(calculateFundingProgressPercent(50, 200)).toBe(25)
		expect(calculateFundingProgressPercent(300, 200)).toBe(100)
	})

	test('returns null when raised is loading or goal is invalid', () => {
		expect(calculateFundingProgressPercent(null, 200)).toBeNull()
		expect(calculateFundingProgressPercent(50, 0)).toBeNull()
	})
})
