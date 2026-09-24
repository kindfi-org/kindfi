process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

import { describe, expect, test, mock } from 'bun:test'
import { resolveKycStatus, isDiditSessionValidForReuse } from '../lib/kyc/session-service'
import { getDiditSessionStatus } from '../lib/services/didit'

// Mock the Didit service
mock.module('../lib/services/didit', () => ({
	getDiditSessionStatus: mock(),
}))

describe('resolveKycStatus', () => {
	test('preserves an approved review over a newer pending session', () => {
		expect(resolveKycStatus({ sessionStatus: 'pending', reviewStatus: 'approved' })).toBe(
			'approved',
		)
	})

	test('keeps the latest non-approved session as the current status', () => {
		expect(resolveKycStatus({ sessionStatus: 'rejected', reviewStatus: 'pending' })).toBe(
			'rejected',
		)
	})

	test('falls back to the review when there is no session', () => {
		expect(resolveKycStatus({ sessionStatus: null, reviewStatus: 'rejected' })).toBe('rejected')
	})
})

describe('isDiditSessionValidForReuse', () => {
	test('returns false for abandoned sessions', async () => {
		mock.mocked(getDiditSessionStatus).mockResolvedValue({
			session_id: 'test-session',
			status: 'Abandoned',
			created_at: '2024-01-01T00:00:00Z',
		})

		const isValid = await isDiditSessionValidForReuse('test-session')
		expect(isValid).toBe(false)
	})

	test('returns false for declined sessions', async () => {
		mock.mocked(getDiditSessionStatus).mockResolvedValue({
			session_id: 'test-session',
			status: 'Declined',
			created_at: '2024-01-01T00:00:00Z',
		})

		const isValid = await isDiditSessionValidForReuse('test-session')
		expect(isValid).toBe(false)
	})

	test('returns true for in-progress sessions', async () => {
		mock.mocked(getDiditSessionStatus).mockResolvedValue({
			session_id: 'test-session',
			status: 'In Progress',
			created_at: '2024-01-01T00:00:00Z',
		})

		const isValid = await isDiditSessionValidForReuse('test-session')
		expect(isValid).toBe(true)
	})

	test('returns true for approved sessions', async () => {
		mock.mocked(getDiditSessionStatus).mockResolvedValue({
			session_id: 'test-session',
			status: 'Approved',
			created_at: '2024-01-01T00:00:00Z',
		})

		const isValid = await isDiditSessionValidForReuse('test-session')
		expect(isValid).toBe(true)
	})

	test('returns false when API call fails', async () => {
		mock.mocked(getDiditSessionStatus).mockRejectedValue(new Error('API error'))

		const isValid = await isDiditSessionValidForReuse('test-session')
		expect(isValid).toBe(false)
	})
})
