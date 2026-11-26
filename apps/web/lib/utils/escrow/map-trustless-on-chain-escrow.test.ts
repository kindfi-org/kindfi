import { describe, expect, test } from 'bun:test'
import {
	mapMultiReleaseV2EscrowToIndexer,
	mapSingleReleaseV2EscrowToIndexer,
} from './map-trustless-on-chain-escrow'

const gAddress = (label: string) => `G${label.padEnd(55, 'A')}`

describe('mapTrustlessOnChainEscrow', () => {
	test('maps single-release v2 roles arrays to indexer shape', () => {
		const escrow = mapSingleReleaseV2EscrowToIndexer({
			contractId: 'CAC4IETJ35MM2C5AIYZRAIXZ5M3RJANKHVI4JLYMLXXTBJDFLGXJGAS3',
			engagementId: 'project-1',
			title: 'Ailani',
			description: 'Medical support',
			amount: 1000,
			platformFee: 1,
			roles: {
				approvers: [gAddress('APPROVER')],
				serviceProviders: [gAddress('SERVICE')],
				disputeResolvers: [gAddress('DISPUTE')],
				platform: gAddress('PLATFORM'),
				releaseSigners: [gAddress('RELEASE')],
				receiver: gAddress('RECEIVER'),
			},
			milestones: [],
		})

		expect(escrow.type).toBe('single-release')
		expect(escrow.roles.approver).toBe(gAddress('APPROVER'))
		expect(escrow.roles.receiver).toBe(gAddress('RECEIVER'))
	})

	test('maps multi-release v2 milestones with per-milestone receivers', () => {
		const escrow = mapMultiReleaseV2EscrowToIndexer({
			contractId: 'CAC4IETJ35MM2C5AIYZRAIXZ5M3RJANKHVI4JLYMLXXTBJDFLGXJGAS3',
			engagementId: 'project-1',
			title: 'Ailani',
			description: 'Medical support',
			platformFee: 1,
			roles: {
				approvers: [gAddress('APPROVER')],
				serviceProviders: [gAddress('SERVICE')],
				disputeResolvers: [gAddress('DISPUTE')],
				platform: gAddress('PLATFORM'),
				releaseSigners: [gAddress('RELEASE')],
			},
			milestones: [
				{
					description: 'Surgery',
					amount: 500,
					receiver: gAddress('RECEIVER'),
				},
			],
		})

		expect(escrow.type).toBe('multi-release')
		expect(escrow.milestones).toEqual([
			{
				description: 'Surgery',
				amount: 500,
				receiver: gAddress('RECEIVER'),
			},
		])
	})
})
