import { describe, expect, test } from 'bun:test'
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import {
	buildEditReleasePayload,
	buildUpdateEscrowPayload,
	isMilestoneEditable,
} from './build-update-escrow-payload'

const platformAddress = 'GPLATFORM12345678901234567890123456789012'

const baseEscrowData: GetEscrowsFromIndexerResponse = {
	contractId: 'CEScrow12345678901234567890123456789012',
	engagementId: 'project-1',
	title: 'Test Escrow',
	description: 'Test description',
	amount: 1000,
	platformFee: 100,
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
	test('normalizes indexer centi-percent platform fee for update API', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			platformFee: 100,
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

		expect(payload.escrow.platformFee).toBe(1)
		expect(payload.escrow.flags).toBeUndefined()
		expect(payload.escrow.isActive).toBe(true)
		expect(payload.escrow.receiverMemo).toBe(0)
		expect(payload.escrow.milestones[0]).toMatchObject({
			description: 'Design',
			amount: 500,
			evidence: '',
		})
		expect('flags' in payload.escrow.milestones[0]).toBe(false)
	})

	test('preserves sub-one-percent platform fees from indexer centi values', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			platformFee: 60,
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
				},
			],
		}

		const payload = buildUpdateEscrowPayload(multiEscrow, 'multi-release', platformAddress, {
			description: 'Build',
			amount: 1500,
			receiver: 'GReceiver1234567890123456789012345678901',
		})

		expect(payload.escrow.platformFee).toBe(0.6)
	})

	test('normalizes higher indexer centi-percent platform fees', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			platformFee: 300,
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
				},
			],
		}

		const payload = buildUpdateEscrowPayload(multiEscrow, 'multi-release', platformAddress, {
			description: 'Build',
			amount: 1500,
			receiver: 'GReceiver1234567890123456789012345678901',
		})

		expect(payload.escrow.platformFee).toBe(3)
	})

	test('includes receiver memo from validated escrow data', () => {
		const multiEscrow = {
			...baseEscrowData,
			type: 'multi-release' as const,
			receiverMemo: 3,
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
				},
			],
		}

		const payload = buildUpdateEscrowPayload(multiEscrow, 'multi-release', platformAddress, {
			description: 'Build',
			amount: 1500,
			receiver: 'GReceiver1234567890123456789012345678901',
		})

		expect(payload.escrow.receiverMemo).toBe(3)
	})

	test('appends a new single-release milestone', () => {
		const payload = buildUpdateEscrowPayload(baseEscrowData, 'single-release', platformAddress, {
			description: 'Phase 2',
		})

		expect(payload.signer).toBe(platformAddress)
		expect(payload.escrow.milestones).toHaveLength(2)
		expect(payload.escrow.milestones[1]).toEqual({ description: 'Phase 2' })
	})
})

describe('buildEditReleasePayload', () => {
	test('updates an unapproved multi-release milestone', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			platformFee: 100,
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: false },
				},
				{
					description: 'Build',
					amount: 1500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: false },
				},
			],
		}

		const payload = buildEditReleasePayload(multiEscrow, 'multi-release', platformAddress, 0, {
			description: 'Updated design',
			amount: 750,
			receiver: 'GReceiver1234567890123456789012345678901',
		})

		expect(payload.escrow.platformFee).toBe(1)
		expect(payload.escrow.milestones[0]).toMatchObject({
			description: 'Updated design',
			amount: 750,
			evidence: '',
		})
		expect(payload.escrow.milestones[1]).toMatchObject({
			description: 'Build',
			amount: 1500,
			evidence: '',
		})
	})

	test('rejects editing an approved milestone', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: true },
				},
			],
		}

		expect(() =>
			buildEditReleasePayload(multiEscrow, 'multi-release', platformAddress, 0, {
				description: 'Updated design',
				amount: 750,
				receiver: 'GReceiver1234567890123456789012345678901',
			}),
		).toThrow('already approved')
	})
})

describe('isMilestoneEditable', () => {
	test('returns false for approved milestones', () => {
		expect(
			isMilestoneEditable({
				description: 'Design',
				amount: 500,
				receiver: 'GReceiver1234567890123456789012345678901',
				flags: { approved: true },
			}),
		).toBe(false)
	})

	test('returns true for pending unapproved milestones', () => {
		expect(
			isMilestoneEditable({
				description: 'Design',
				amount: 500,
				receiver: 'GReceiver1234567890123456789012345678901',
				flags: { approved: false },
			}),
		).toBe(true)
	})
})
