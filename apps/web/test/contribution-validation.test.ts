import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
	CAMPAIGN_COMPLETE_DONATION_MESSAGE,
	PROJECT_NOT_ACCEPTING_DONATIONS_MESSAGE,
} from '~/lib/projects/project-status'

const PROJECT_ID = '11111111-1111-1111-1111-111111111111'
const CONTRACT_ID = 'CEScrow12345678901234567890123456789012'

type ProjectRow = {
	status: string
	target_amount: number
	current_amount: number
}

let projectRow: ProjectRow | null = {
	status: 'active',
	target_amount: 1000,
	current_amount: 250,
}

const mockGetEscrowBalance = mock(async () => 250 as number | null)

mock.module('@/lib/logger', () => ({
	logger: { warn: () => {}, error: () => {}, info: () => {} },
}))

mock.module('~/lib/services/escrow-balance.service', () => ({
	getEscrowBalance: mockGetEscrowBalance,
}))

mock.module('@packages/lib/supabase', () => ({
	supabase: {
		from: (table: string) => ({
			select: () => ({
				eq: () => ({
					single: async () => {
						if (table === 'projects') {
							if (!projectRow) {
								return { data: null, error: { message: 'not found' } }
							}

							return { data: projectRow, error: null }
						}

						return { data: null, error: null }
					},
					maybeSingle: async () => {
						if (table === 'escrow_contracts') {
							return { data: { project_id: PROJECT_ID, contract_id: CONTRACT_ID }, error: null }
						}

						return { data: null, error: null }
					},
				}),
			}),
		}),
	},
}))

describe('validateContributionAllowed', () => {
	beforeEach(() => {
		projectRow = {
			status: 'active',
			target_amount: 1000,
			current_amount: 250,
		}
		mockGetEscrowBalance.mockImplementation(async () => 250)
	})

	test('allows active campaigns under fundraising goal', async () => {
		const { validateContributionAllowed } = await import(
			'~/lib/services/contribution-validation.service'
		)

		const result = await validateContributionAllowed(PROJECT_ID, CONTRACT_ID)

		expect(result).toEqual({ allowed: true })
	})

	test('rejects completed campaigns with campaign complete message', async () => {
		projectRow = {
			status: 'funded',
			target_amount: 1000,
			current_amount: 250,
		}

		const { validateContributionAllowed } = await import(
			'~/lib/services/contribution-validation.service'
		)

		const result = await validateContributionAllowed(PROJECT_ID, CONTRACT_ID)

		expect(result).toEqual({
			allowed: false,
			error: CAMPAIGN_COMPLETE_DONATION_MESSAGE,
		})
	})

	test('rejects paused campaigns with generic not accepting message', async () => {
		projectRow = {
			status: 'paused',
			target_amount: 1000,
			current_amount: 250,
		}

		const { validateContributionAllowed } = await import(
			'~/lib/services/contribution-validation.service'
		)

		const result = await validateContributionAllowed(PROJECT_ID, CONTRACT_ID)

		expect(result).toEqual({
			allowed: false,
			error: PROJECT_NOT_ACCEPTING_DONATIONS_MESSAGE,
		})
	})

	test('rejects active campaigns that reached fundraising goal', async () => {
		projectRow = {
			status: 'active',
			target_amount: 1000,
			current_amount: 900,
		}
		mockGetEscrowBalance.mockImplementation(async () => 1000)

		const { validateContributionAllowed } = await import(
			'~/lib/services/contribution-validation.service'
		)

		const result = await validateContributionAllowed(PROJECT_ID, CONTRACT_ID)

		expect(result.allowed).toBe(false)
		if (!result.allowed) {
			expect(result.error).toContain('fundraising goal')
		}
	})
})

describe('checkFundraisingGoalNotReached', () => {
	test('delegates to validateContributionAllowed', async () => {
		projectRow = {
			status: 'funded',
			target_amount: 1000,
			current_amount: 250,
		}

		const { checkFundraisingGoalNotReached } = await import(
			'~/lib/services/contribution-validation.service'
		)

		const result = await checkFundraisingGoalNotReached(PROJECT_ID, CONTRACT_ID)

		expect(result).toEqual({
			allowed: false,
			error: CAMPAIGN_COMPLETE_DONATION_MESSAGE,
		})
	})
})

describe('fund escrow proxy helpers', () => {
	beforeEach(() => {
		projectRow = {
			status: 'active',
			target_amount: 1000,
			current_amount: 250,
		}
	})

	test('isFundEscrowProxyPath matches escrow fund routes only', async () => {
		const { isFundEscrowProxyPath } = await import('~/lib/services/contribution-validation.service')

		expect(isFundEscrowProxyPath('escrow/single-release/fund-escrow', 'POST')).toBe(true)
		expect(isFundEscrowProxyPath('escrow/multi-release/fund-escrow', 'POST')).toBe(true)
		expect(isFundEscrowProxyPath('escrow/single-release/fund-escrow', 'GET')).toBe(false)
		expect(isFundEscrowProxyPath('helper/send-transaction', 'POST')).toBe(false)
	})

	test('readContractIdFromFundEscrowBody extracts contractId', async () => {
		const { readContractIdFromFundEscrowBody } = await import(
			'~/lib/services/contribution-validation.service'
		)

		expect(
			readContractIdFromFundEscrowBody(
				JSON.stringify({ contractId: CONTRACT_ID, amount: 25, signer: 'GABC123' }),
			),
		).toBe(CONTRACT_ID)
		expect(readContractIdFromFundEscrowBody('{}')).toBeNull()
	})

	test('validateFundEscrowProxyRequest rejects completed campaigns', async () => {
		projectRow = {
			status: 'funded',
			target_amount: 1000,
			current_amount: 250,
		}

		const { validateFundEscrowProxyRequest } = await import(
			'~/lib/services/contribution-validation.service'
		)

		const result = await validateFundEscrowProxyRequest(
			JSON.stringify({ contractId: CONTRACT_ID, amount: 25 }),
		)

		expect(result).toEqual({
			ok: false,
			error: CAMPAIGN_COMPLETE_DONATION_MESSAGE,
			status: 403,
		})
	})
})
