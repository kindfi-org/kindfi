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

	beforeEach(() => {
		mockEventsResult = { data: [], error: null }
		mockFailuresResult = { data: [], error: null }
		mockSessionsResult = { data: [], error: null }

		globalThis.__mockSupabaseClient = {
			from: (table: string) => {
				if (table === 'authorization_events') {
					return {
						select: () => ({
							gte: () => Promise.resolve(mockEventsResult),
						}),
					}
				}
				if (table === 'webhook_events') {
					return {
						select: () => ({
							in: () => ({
								gte: () => Promise.resolve(mockFailuresResult),
							}),
						}),
					}
				}
				if (table === 'didit_sessions') {
					return {
						select: () => Promise.resolve(mockSessionsResult),
					}
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
})
