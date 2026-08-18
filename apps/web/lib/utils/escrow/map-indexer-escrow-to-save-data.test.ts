import { describe, expect, test } from 'bun:test'
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { KINDFI_PLATFORM_FEE_PERCENT } from '~/lib/utils/escrow/platform-fee'
import { mapIndexerEscrowToSaveData } from './map-indexer-escrow-to-save-data'

const gAddress = (label: string) => `G${label.padEnd(55, 'A')}`

const baseRoles = {
	approver: gAddress('APPROVER'),
	serviceProvider: gAddress('SERVICE'),
	disputeResolver: gAddress('DISPUTE'),
	platformAddress: gAddress('PLATFORM'),
	releaseSigner: gAddress('RELEASE'),
	receiver: gAddress('RECEIVER'),
}

describe('mapIndexerEscrowToSaveData', () => {
	test('coerces string milestone amounts and fills empty description', () => {
		const escrow = {
			type: 'multi-release',
			engagementId: 'project-1',
			title: 'Ailani escrow',
			description: '   ',
			roles: baseRoles,
			milestones: [
				{
					amount: '250',
					receiver: baseRoles.receiver,
					description: 'Surgery',
				},
			],
		} as unknown as GetEscrowsFromIndexerResponse

		const result = mapIndexerEscrowToSaveData(escrow)

		expect(result.description).toBe('Ailani escrow')
		expect(result.platformFee).toBe(KINDFI_PLATFORM_FEE_PERCENT)
		expect(result.milestones).toEqual([
			{
				amount: 250,
				receiver: baseRoles.receiver,
			},
		])
	})
})
