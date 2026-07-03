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

	test('includes empty evidence for existing multi-release milestones when adding', () => {
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

		expect(payload.escrow.milestones).toHaveLength(2)
		expect(payload.escrow.milestones[0]).toMatchObject({
			description: 'Design',
			amount: 500,
			evidence: '',
		})

		if ('amount' in payload.escrow.milestones[1]) {
			expect(payload.escrow.milestones[1].amount).toBe(1500)
		} else {
			throw new Error('Expected multi-release milestone')
		}
	})

	test('preserves existing evidence when adding a release', () => {
		const multiEscrow: GetEscrowsFromIndexerResponse = {
			...baseEscrowData,
			type: 'multi-release',
			milestones: [
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					evidence: 'https://example.com/proof.pdf',
					flags: { approved: false },
				},
			],
		}

		const payload = buildUpdateEscrowPayload(multiEscrow, 'multi-release', platformAddress, {
			description: 'Build',
			amount: 1500,
			receiver: 'GReceiver1234567890123456789012345678901',
		})

		expect(payload.escrow.milestones[0]).toMatchObject({
			evidence: 'https://example.com/proof.pdf',
		})
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
		).toThrow('Only the platform address can update releases')
	})
})

describe('buildEditReleasePayload', () => {
	test('updates an unapproved multi-release milestone', () => {
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

	test('rejects editing when escrow has funds', () => {
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

		expect(() =>
			buildEditReleasePayload(
				multiEscrow,
				'multi-release',
				platformAddress,
				0,
				{
					description: 'Updated design',
					amount: 750,
					receiver: 'GReceiver1234567890123456789012345678901',
				},
				true,
			),
		).toThrow('Cannot edit existing releases after the escrow has been funded')
	})
})

describe('isMilestoneEditable', () => {
	test('returns false for approved milestones', () => {
		expect(
			isMilestoneEditable(
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: true },
				},
				false,
			),
		).toBe(false)
	})

	test('returns false when escrow has funds', () => {
		expect(
			isMilestoneEditable(
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: false },
				},
				true,
			),
		).toBe(false)
	})

	test('returns true for pending unapproved milestones before funding', () => {
		expect(
			isMilestoneEditable(
				{
					description: 'Design',
					amount: 500,
					receiver: 'GReceiver1234567890123456789012345678901',
					flags: { approved: false },
				},
				false,
			),
		).toBe(true)
	})
})
