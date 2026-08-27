import { describe, expect, test } from 'bun:test'
import {
	canonicalFromDbStatus,
	reasonCodeForStatus,
	requiredActionForStatus,
	toCanonicalKycStatus,
	toKycDbStatus,
} from '../lib/kyc/status'

describe('toCanonicalKycStatus', () => {
	test('maps every documented Didit status', () => {
		expect(toCanonicalKycStatus('Not Started')).toBe('not_started')
		expect(toCanonicalKycStatus('In Progress')).toBe('pending')
		expect(toCanonicalKycStatus('In Review')).toBe('in_review')
		expect(toCanonicalKycStatus('Approved')).toBe('approved')
		expect(toCanonicalKycStatus('Verified')).toBe('approved')
		expect(toCanonicalKycStatus('Declined')).toBe('rejected')
		expect(toCanonicalKycStatus('Rejected')).toBe('rejected')
		expect(toCanonicalKycStatus('Abandoned')).toBe('expired')
		expect(toCanonicalKycStatus('Expired')).toBe('expired')
		expect(toCanonicalKycStatus('Manual Review')).toBe('manual_review')
	})

	test('resolves approved/verified ambiguity to approved', () => {
		expect(toCanonicalKycStatus('approved')).toBe('approved')
		expect(toCanonicalKycStatus('verified')).toBe('approved')
		expect(toCanonicalKycStatus('VERIFIED')).toBe('approved')
		expect(toCanonicalKycStatus('  Approved  ')).toBe('approved')
	})

	test('normalizes compact and separator variants', () => {
		expect(toCanonicalKycStatus('inreview')).toBe('in_review')
		expect(toCanonicalKycStatus('manual-review')).toBe('manual_review')
		expect(toCanonicalKycStatus('notstarted')).toBe('not_started')
	})

	test('treats missing status as not_started', () => {
		expect(toCanonicalKycStatus(null)).toBe('not_started')
		expect(toCanonicalKycStatus(undefined)).toBe('not_started')
		expect(toCanonicalKycStatus('')).toBe('not_started')
	})

	test('unknown Didit values fall back to pending', () => {
		expect(toCanonicalKycStatus('Something New')).toBe('pending')
	})
})

describe('toKycDbStatus', () => {
	test('stores approved and rejected on the existing enum', () => {
		expect(toKycDbStatus('approved')).toBe('approved')
		expect(toKycDbStatus('rejected')).toBe('rejected')
		expect(toKycDbStatus('pending')).toBe('pending')
		expect(toKycDbStatus('expired')).toBe('pending')
		expect(toKycDbStatus('in_review')).toBe('pending')
	})
})

describe('canonicalFromDbStatus', () => {
	test('maps verified to approved', () => {
		expect(canonicalFromDbStatus('verified')).toBe('approved')
		expect(canonicalFromDbStatus('approved')).toBe('approved')
		expect(canonicalFromDbStatus('rejected')).toBe('rejected')
		expect(canonicalFromDbStatus('pending')).toBe('pending')
		expect(canonicalFromDbStatus(null)).toBe('not_started')
	})
})

describe('policy helpers', () => {
	test('approved requires no follow-up', () => {
		expect(reasonCodeForStatus('approved')).toBe('kyc_approved')
		expect(requiredActionForStatus('approved')).toBeUndefined()
	})

	test('not started and expired ask the user to start KYC', () => {
		expect(requiredActionForStatus('not_started')).toBe('start_kyc')
		expect(requiredActionForStatus('expired')).toBe('start_kyc')
	})

	test('in-flight states ask the user to wait', () => {
		expect(requiredActionForStatus('pending')).toBe('wait_for_review')
		expect(requiredActionForStatus('in_review')).toBe('wait_for_review')
		expect(requiredActionForStatus('manual_review')).toBe('wait_for_review')
		expect(requiredActionForStatus('provider_unavailable')).toBe('wait_for_review')
	})

	test('rejected points to support', () => {
		expect(requiredActionForStatus('rejected')).toBe('contact_support')
		expect(reasonCodeForStatus('rejected')).toBe('kyc_rejected')
	})
})
