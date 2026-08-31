import { describe, expect, mock, test } from 'bun:test'
import { isStaleProviderEvent } from '../lib/kyc/provider-event'

const mockGetKycSchemaClient = mock(() => ({ from: () => undefined }))
const mockFindDiditSessionBySessionId = mock(async () => ({
	userId: 'user-1',
	kycReviewId: null,
	canonicalStatus: 'approved',
	lastProviderEventAt: '2026-08-25T11:00:00.000Z',
	diditStatus: 'Approved',
} as const))
const mockUpsertKycReviewStatus = mock(async () => 'review-1')
const mockRecordKycStatusTransition = mock(async () => undefined)
const mockActivatePollarIfApproved = mock(async () => undefined)

mock.module('@/lib/logger', () => ({
	logger: {
		error: mock(() => undefined),
		warn: mock(() => undefined),
		info: mock(() => undefined),
	},
}))

mock.module('../lib/kyc/supabase-kyc-client', () => ({
	getKycSchemaClient: mockGetKycSchemaClient,
}))

mock.module('../lib/kyc/session-service', () => ({
	findDiditSessionBySessionId: mockFindDiditSessionBySessionId,
	recordKycStatusTransition: mockRecordKycStatusTransition,
	upsertKycReviewStatus: mockUpsertKycReviewStatus,
	activatePollarIfApproved: mockActivatePollarIfApproved,
}))

const { applyDiditStatusUpdate } = await import('../lib/kyc/webhook-service')

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

describe('applyDiditStatusUpdate', () => {
	test('marks a concurrent stale write as stale when no conditional row is updated', async () => {
		const staleEventUpdate = mock(async () => ({ error: null }))
		const diditSessionUpdate = {
			eq: mock(() => diditSessionUpdate),
			or: mock(() => diditSessionUpdate),
			select: mock(async () => ({ data: [], error: null })),
			update: mock(() => diditSessionUpdate),
		}
		const webhookEventUpdate = {
			eq: mock(() => webhookEventUpdate),
			update: mock(() => webhookEventUpdate),
		}
		const webhookEventInsert = mock(async () => ({ error: null }))

		mockGetKycSchemaClient.mockImplementation(() => ({
			from: (table: string) => {
				if (table === 'webhook_events') {
					return {
						insert: webhookEventInsert,
						update: mock(() => webhookEventUpdate),
					}
				}
				if (table === 'didit_sessions') return diditSessionUpdate
				throw new Error(`Unexpected table: ${table}`)
			},
		}))

		const result = await applyDiditStatusUpdate({
			sessionId: 'session-1',
			diditStatus: 'pending',
			source: 'webhook',
			providerEventAt: new Date('2026-08-25T11:00:00.000Z'),
		})

		expect(result).toEqual({ applied: false, reason: 'stale', canonicalStatus: 'pending', userId: 'user-1' })
		expect(staleEventUpdate).not.toHaveBeenCalled()
	})
})
