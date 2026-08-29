import { describe, expect, it, mock } from 'bun:test'

/**
 * Mock Supabase clients before importing session-service.
 * The module-level imports trigger Supabase client creation which requires
 * env vars. We mock them so the pure functions can be tested in isolation.
 */
mock.module('@packages/lib/supabase', () => ({
	supabase: { from: () => ({}) },
}))

mock.module('~/lib/logger', () => ({
	logger: { error: () => {}, warn: () => {}, info: () => {} },
}))

mock.module('~/lib/kyc/supabase-kyc-client', () => ({
	getKycSchemaClient: () => ({ from: () => ({}) }),
}))

const { resolveKycStatus } = await import('~/lib/kyc/session-service')

/**
 * Regression tests for #1035: Preserve approved KYC status over newer
 * non-approved sessions.
 *
 * The resolution logic must ensure that an approved KYC review (or session)
 * is never downgraded by a newer non-approved Didit session.
 */

describe('resolveKycStatus', () => {
	it('returns approved when session is approved', () => {
		const result = resolveKycStatus({
			sessionStatus: 'approved',
			reviewStatus: null,
		})
		expect(result).toBe('approved')
	})

	it('returns approved when review is approved and session is non-approved', () => {
		/**
		 * Regression scenario: user has an approved review but started a new
		 * verification session that is still pending. The approved review must
		 * take precedence over the newer non-approved session.
		 */
		const result = resolveKycStatus({
			sessionStatus: 'pending',
			reviewStatus: 'approved',
		})
		expect(result).toBe('approved')
	})

	it('returns approved when review is approved and session is rejected', () => {
		/**
		 * An approved review should still take precedence even if the newer
		 * session was explicitly rejected.
		 */
		const result = resolveKycStatus({
			sessionStatus: 'rejected',
			reviewStatus: 'approved',
		})
		expect(result).toBe('approved')
	})

	it('returns approved when review is approved and session is not_started', () => {
		const result = resolveKycStatus({
			sessionStatus: 'not_started',
			reviewStatus: 'approved',
		})
		expect(result).toBe('approved')
	})

	it('preserves session-first resolution for non-approved cases', () => {
		/**
		 * When neither session nor review is approved, session status should
		 * take precedence (current session-first behavior preserved).
		 */
		const result = resolveKycStatus({
			sessionStatus: 'pending',
			reviewStatus: null,
		})
		expect(result).toBe('pending')
	})

	it('returns not_started when both are null', () => {
		const result = resolveKycStatus({
			sessionStatus: null,
			reviewStatus: null,
		})
		expect(result).toBe('not_started')
	})

	it('returns review status as fallback when session is null', () => {
		const result = resolveKycStatus({
			sessionStatus: null,
			reviewStatus: 'rejected',
		})
		expect(result).toBe('rejected')
	})

	it('returns session status when review is null and session is non-approved', () => {
		const result = resolveKycStatus({
			sessionStatus: 'in_review',
			reviewStatus: null,
		})
		expect(result).toBe('in_review')
	})

	it('returns session status when both are non-approved (session-first)', () => {
		const result = resolveKycStatus({
			sessionStatus: 'expired',
			reviewStatus: 'pending',
		})
		expect(result).toBe('expired')
	})

	it('returns approved when both session and review are approved', () => {
		const result = resolveKycStatus({
			sessionStatus: 'approved',
			reviewStatus: 'approved',
		})
		expect(result).toBe('approved')
	})

	it('returns approved when review is verified (legacy alias) and session is pending', () => {
		/**
		 * 'verified' maps to 'approved' via canonicalFromDbStatus, so this
		 * is another form of the regression scenario.
		 */
		const result = resolveKycStatus({
			sessionStatus: 'pending',
			reviewStatus: 'verified',
		})
		expect(result).toBe('approved')
	})

	it('returns approved when session is rejected but review is approved', () => {
		/**
		 * Even if a newer session was declined, an approved review must
		 * preserve the approved state.
		 */
		const result = resolveKycStatus({
			sessionStatus: 'rejected',
			reviewStatus: 'approved',
		})
		expect(result).toBe('approved')
	})

	it('returns approved when session is expired but review is approved', () => {
		const result = resolveKycStatus({
			sessionStatus: 'expired',
			reviewStatus: 'approved',
		})
		expect(result).toBe('approved')
	})
})
