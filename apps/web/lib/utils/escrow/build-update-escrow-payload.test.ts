import { describe, expect, test } from 'bun:test'
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { buildUpdateEscrowPayload } from './build-update-escrow-payload'

const platformAddress = 'GPLATFORM12345678901234567890123456789012'

const baseEscrowData: GetEscrowsFromIndexerResponse = {
	contractId: 'CEScrow12345678901234567890123456789012',
	engagementId: 'project-1',
	title: 'Test Escrow',
	description: 'Test description',
	amount: 1000,
	platformFee: 10,
	roles: {
		approver: 'GApprover1234567890123456789012345678901',
		serviceProvider: 'GService1234567890123456789012345678901',
		platformAddress,
		releaseSigner: 'GRelease1234567890123456789012345678901',
		disputeResolver: 'GDispute1234567890123456789012345678901',
		receiver: 'GReceiver1234567890123456789012345678901',
	},
	milestones: [
		{
			description: 'Phase 1',
			approved: false,
			status: 'pending',
		},
	],
	flags: { disputed: false, released: false, resolved: false },
	trustline: { address: 'CTRUSTLINE1234567890123456789012345678', symbol: 'USDC' },
	isActive: true,
	user: 'GUser123456789012345678901234567890123',
	createdAt: new Date(),
	updatedAt: new Date(),
	type: 'single-release',
}

describe('buildUpdateEscrowPayload', () => {
	test('appends a new single-release milestone', () => {
		const payload = buildUpdateEscrowPayload(baseEscrowData, 'single-release', platformAddress, {
			description: 'Phase 2',
		})

		expect(payload.signer).toBe(platformAddress)
		expect(payload.escrow.milestones).toHaveLength(2)
		expect(payload.escrow.milestones[1]).toEqual({ description: 'Phase 2' })
	})

	test('appends a new multi-release milestone', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: false },
				},
			],
		}

		const payload = buildUpdateEscrowPayload(multiEscrow, 'multi-release', platformAddress, {
			description: 'Build',
			amount: 1500,
			receiver: 'GReceiver1234567890123456789012345678901',
		})

		if ('amount' in payload.escrow.milestones[1]) {
			expect(payload.escrow.milestones[1].amount).toBe(1500)
		} else {
			throw new Error('Expected multi-release milestone')
		}
	})

	test('rejects non-platform signer', () => {
		expect(() =>
			buildUpdateEscrowPayload(
				baseEscrowData,
				'single-release',
				'GOther123456789012345678901234567890123',
				{
					description: 'Phase 2',
				},
			),
		).toThrow('Only the platform address can add releases')
	})
})
