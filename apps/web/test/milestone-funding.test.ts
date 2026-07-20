import { describe, expect, test } from 'bun:test'
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import {
	calculateReleasedAmount,
	calculateReleasedAmountFromEscrow,
	calculateReleasedProgressPercent,
	resolveDisplayReleasedAmount,
} from '~/lib/utils/projects/milestone-funding'

const baseEscrow = {
	contractId: 'CEScrow12345678901234567890123456789012',
	engagementId: 'project-1',
	title: 'Test Escrow',
	description: 'Test description',
	platformFee: 100,
	roles: {
		approver: 'GApprover1234567890123456789012345678901',
		serviceProvider: 'GService1234567890123456789012345678901',
		platformAddress: 'GPLATFORM12345678901234567890123456789012',
		releaseSigner: 'GRelease1234567890123456789012345678901',
		disputeResolver: 'GDispute1234567890123456789012345678901',
		receiver: 'GReceiver1234567890123456789012345678901',
	},
	flags: { disputed: false, released: false },
	trustline: { address: 'USDC_ADDRESS', decimals: 7 },
} as unknown as GetEscrowsFromIndexerResponse

describe('calculateReleasedAmount', () => {
	test('sums only milestones with released status', () => {
		const milestones = [
			{ amount: 100, status: 'released' },
			{ amount: 50, status: 'approved' },
			{ amount: 25, status: 'pending' },
			{ amount: 30, status: 'released' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(130)
	})

	test('returns 0 when no milestone is released', () => {
		const milestones = [
			{ amount: 100, status: 'approved' },
			{ amount: 50, status: 'disputed' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(0)
	})

	test('coerces string amounts from the database', () => {
		const milestones = [
			{ amount: '100.5', status: 'released' },
			{ amount: '9.5', status: 'released' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(110)
	})

	test('returns 0 for empty, null, or undefined input', () => {
		expect(calculateReleasedAmount([])).toBe(0)
		expect(calculateReleasedAmount(null)).toBe(0)
		expect(calculateReleasedAmount(undefined)).toBe(0)
	})

	test('ignores null/undefined amounts on released milestones', () => {
		const milestones = [
			{ amount: null, status: 'released' },
			{ amount: 40, status: 'released' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(40)
	})
})

describe('calculateReleasedProgressPercent', () => {
	test('computes percentage of goal, rounded and clamped to 100', () => {
		expect(calculateReleasedProgressPercent(50, 200)).toBe(25)
		expect(calculateReleasedProgressPercent(300, 200)).toBe(100)
	})

	test('returns null when goal is missing or non-positive', () => {
		expect(calculateReleasedProgressPercent(50, 0)).toBeNull()
		expect(calculateReleasedProgressPercent(50, null)).toBeNull()
		expect(calculateReleasedProgressPercent(50, undefined)).toBeNull()
	})
})

describe('calculateReleasedAmountFromEscrow', () => {
	test('sums only released multi-release milestone amounts', () => {
		const escrow = {
			...baseEscrow,
			type: 'multi-release',
			milestones: [
				{ amount: 100, receiver: 'G1', flags: { released: true } },
				{ amount: 50, receiver: 'G2', flags: { released: false } },
				{ amount: 30, receiver: 'G3', flags: { released: true } },
			],
		} as unknown as GetEscrowsFromIndexerResponse

		expect(calculateReleasedAmountFromEscrow(escrow)).toBe(130)
	})

	test('returns 0 for multi-release when no milestones are released', () => {
		const escrow = {
			...baseEscrow,
			type: 'multi-release',
			milestones: [
				{ amount: 100, receiver: 'G1', flags: { released: false } },
				{ amount: 50, receiver: 'G2', flags: { released: false } },
			],
		} as unknown as GetEscrowsFromIndexerResponse

		expect(calculateReleasedAmountFromEscrow(escrow)).toBe(0)
	})

	test('returns full amount for single-release when escrow is released', () => {
		const escrow = {
			...baseEscrow,
			type: 'single-release',
			amount: 500,
			flags: { disputed: false, released: true },
			milestones: [{ approved: true }],
		} as unknown as GetEscrowsFromIndexerResponse

		expect(calculateReleasedAmountFromEscrow(escrow)).toBe(500)
	})

	test('returns 0 for single-release when escrow is not released', () => {
		const escrow = {
			...baseEscrow,
			type: 'single-release',
			amount: 500,
			flags: { disputed: false, released: false },
			milestones: [{ approved: true }],
		} as unknown as GetEscrowsFromIndexerResponse

		expect(calculateReleasedAmountFromEscrow(escrow)).toBe(0)
	})

	test('returns 0 for null or undefined escrow', () => {
		expect(calculateReleasedAmountFromEscrow(null)).toBe(0)
		expect(calculateReleasedAmountFromEscrow(undefined)).toBe(0)
	})
})

describe('resolveDisplayReleasedAmount', () => {
	test('returns null while on-chain data is loading for escrow projects', () => {
		expect(
			resolveDisplayReleasedAmount({
				escrowContractAddress: 'CEScrow12345678901234567890123456789012',
				isLoadingOnChain: true,
			}),
		).toBeNull()
	})

	test('uses on-chain amount when available for escrow projects', () => {
		expect(
			resolveDisplayReleasedAmount({
				escrowContractAddress: 'CEScrow12345678901234567890123456789012',
				onChainReleasedAmount: 250,
				isLoadingOnChain: false,
			}),
		).toBe(250)
	})

	test('falls back to DB milestones when project has no escrow', () => {
		expect(
			resolveDisplayReleasedAmount({
				dbMilestones: [
					{ amount: 100, status: 'released' },
					{ amount: 50, status: 'pending' },
				],
			}),
		).toBe(100)
	})
})
