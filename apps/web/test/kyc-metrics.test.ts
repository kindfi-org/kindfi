import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { getKycEnforcementMetrics } from '../lib/kyc/metrics'

// Define a global to hold our mock responses per-test
declare global {
	var __mockSupabaseClient: any
}

mock.module('../lib/kyc/supabase-kyc-client', () => {
	return {
		getKycSchemaClient: () => globalThis.__mockSupabaseClient,
	}
})

describe('getKycEnforcementMetrics', () => {
	let mockEventsResult: any
	let mockFailuresResult: any
	let mockSessionsResult: any
	let recordedFilters: Array<{ table: string; column: string; value: string }>

	beforeEach(() => {
		mockEventsResult = { data: [], error: null }
		mockFailuresResult = { data: [], error: null }
		mockSessionsResult = { data: [], error: null }
		recordedFilters = []

		const results: Record<string, unknown> = {
			authorization_events: mockEventsResult,
			webhook_events: mockFailuresResult,
			didit_sessions: mockSessionsResult,
		}

		/** Record the period filter a table query was given, then resolve its stubbed result. */
		const gte = (table: string) => (column: string, value: string) => {
			recordedFilters.push({ table, column, value })
			return Promise.resolve(results[table])
		}

		globalThis.__mockSupabaseClient = {
			from: (table: string) => {
				if (table === 'authorization_events' || table === 'didit_sessions') {
					return { select: () => ({ gte: gte(table) }) }
				}
				if (table === 'webhook_events') {
					return { select: () => ({ in: () => ({ gte: gte(table) }) }) }
				}
				throw new Error(`Unexpected table mock: ${table}`)
			},
		}
	})

	test('throws error if authorization_events query fails', async () => {
		mockEventsResult = { error: { message: 'db connection failed' } }
		await expect(getKycEnforcementMetrics()).rejects.toThrow(
			'Failed to load authorization metrics: db connection failed',
		)
	})

	test('throws error if webhook_events query fails', async () => {
		mockFailuresResult = { error: { message: 'timeout' } }
		await expect(getKycEnforcementMetrics()).rejects.toThrow(
			'Failed to load webhook failure metrics: timeout',
		)
	})

	test('throws error if didit_sessions query fails', async () => {
		mockSessionsResult = { error: { message: 'internal server error' } }
		await expect(getKycEnforcementMetrics()).rejects.toThrow(
			'Failed to load session status metrics: internal server error',
		)
	})

	test('returns metrics when all queries succeed', async () => {
		mockEventsResult = {
			data: [
				{
					action: 'donate',
					current_kyc_status: 'approved',
					hypothetical_allowed: true,
					decision_allowed: true,
					created_at: new Date().toISOString(),
				},
			],
			error: null,
		}

		const metrics = await getKycEnforcementMetrics()
		expect(metrics).toBeDefined()
		expect(metrics.byAction).toBeDefined()
		expect(metrics.periodDays).toBe(30)
		expect(metrics.actionsWithoutApprovedKyc).toBe(0)
		expect(metrics.wouldHaveBlocked).toBe(0)
	})

	test('scopes Didit sessions to the reporting period with the same cutoff as events', async () => {
		mockSessionsResult = {
			data: [
				{ canonical_status: 'approved' },
				{ canonical_status: 'pending' },
				{ canonical_status: 'pending' },
			],
			error: null,
		}

		const metrics = await getKycEnforcementMetrics(7)

		expect(metrics.periodDays).toBe(7)
		expect(metrics.statusDistribution).toEqual([
			{ status: 'approved', count: 1 },
			{ status: 'pending', count: 2 },
		])

		const sessionFilter = recordedFilters.find((filter) => filter.table === 'didit_sessions')
		const eventFilter = recordedFilters.find((filter) => filter.table === 'authorization_events')
		expect(sessionFilter?.column).toBe('created_at')
		expect(sessionFilter?.value).toBe(eventFilter?.value)
	})

	test('scopes Didit sessions for every supported period length', async () => {
		for (const periodDays of [7, 30, 90]) {
			recordedFilters = []
			mockSessionsResult = { data: [{ canonical_status: 'approved' }], error: null }

			const metrics = await getKycEnforcementMetrics(periodDays)

			expect(metrics.periodDays).toBe(periodDays)
			const sessionFilter = recordedFilters.find((f) => f.table === 'didit_sessions')
			const eventFilter = recordedFilters.find((f) => f.table === 'authorization_events')
			expect(sessionFilter?.column).toBe('created_at')
			expect(sessionFilter?.value).toBe(eventFilter?.value)
		}
	})

	test('reports an empty status distribution when no sessions started in the period', async () => {
		mockSessionsResult = { data: [], error: null }

		const metrics = await getKycEnforcementMetrics(90)

		expect(metrics.statusDistribution).toEqual([])
		expect(metrics.statusDistribution.reduce((sum, row) => sum + row.count, 0)).toBe(0)
	})
})
