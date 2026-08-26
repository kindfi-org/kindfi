process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

import { describe, expect, test } from 'bun:test'
import { resolveKycStatus } from '../lib/kyc/session-service'

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
