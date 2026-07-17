import { describe, expect, test } from 'bun:test'
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { resolveValidatedEscrowData } from './resolve-validated-escrow-data'

const mockEscrowData: GetEscrowsFromIndexerResponse = {
	contractId: 'CEScrow12345678901234567890123456789012',
	engagementId: 'project-1',
	title: 'Test Escrow',
	description: 'Test description',
	amount: 1000,
	platformFee: 100,
	roles: {
		approver: 'GApprover1234567890123456789012345678901',
		serviceProvider: 'GService1234567890123456789012345678901',
		platformAddress: 'GPLATFORM12345678901234567890123456789012',
		releaseSigner: 'GRelease1234567890123456789012345678901',
		disputeResolver: 'GDispute1234567890123456789012345678901',
		receiver: 'GReceiver1234567890123456789012345678901',
	},
	milestones: [],
	flags: { disputed: false },
	trustline: { address: 'USDC_ADDRESS', decimals: 7 },
} as unknown as GetEscrowsFromIndexerResponse

describe('resolveValidatedEscrowData', () => {
	test('returns the response directly when given a singular object', () => {
		const result = resolveValidatedEscrowData(mockEscrowData)
		expect(result).toBe(mockEscrowData)
	})

	test('returns the first element when given a non-empty array', () => {
		const second = { ...mockEscrowData, contractId: 'CSecond' } as GetEscrowsFromIndexerResponse
		const result = resolveValidatedEscrowData([mockEscrowData, second])
		expect(result).toBe(mockEscrowData)
	})

	test('throws when given an empty array', () => {
		expect(() => resolveValidatedEscrowData([])).toThrow('No escrow found for this contract ID')
	})
})
