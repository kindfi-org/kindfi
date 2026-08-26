import { describe, expect, test } from 'bun:test'
import { isStaleProviderEvent } from '../lib/kyc/provider-event'

describe('isStaleProviderEvent', () => {
	test('does not treat a newer event as stale', () => {
		expect(isStaleProviderEvent('2026-08-25T12:00:00.000Z', '2026-08-25T11:00:00.000Z')).toBe(false)
	})

	test('marks an older event as stale so it cannot regress KYC status', () => {
		expect(isStaleProviderEvent('2026-08-25T10:00:00.000Z', '2026-08-25T11:00:00.000Z')).toBe(true)
	})

	test('treats equal timestamps as stale when an earlier status would regress a terminal state', () => {
		expect(
			isStaleProviderEvent(
				'2026-08-25T11:00:00.000Z',
				'2026-08-25T11:00:00.000Z',
				'pending',
				'approved',
			),
		).toBe(true)
	})

	test('blocks missing incoming timestamps from regressing a terminal state', () => {
		expect(isStaleProviderEvent(null, '2026-08-25T11:00:00.000Z', 'pending', 'approved')).toBe(true)
		expect(isStaleProviderEvent(null, '2026-08-25T11:00:00.000Z', 'pending', 'rejected')).toBe(true)
	})

	test('does not skip when either timestamp is missing', () => {
		expect(isStaleProviderEvent(null, '2026-08-25T11:00:00.000Z')).toBe(false)
		expect(isStaleProviderEvent('2026-08-25T11:00:00.000Z', null)).toBe(false)
	})
})
