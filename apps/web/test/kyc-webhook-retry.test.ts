import { beforeEach, describe, expect, mock, test } from 'bun:test'

/**
 * Retry coverage for the Didit webhook path.
 *
 * Two boundaries are pinned here:
 *  1. `applyDiditStatusUpdate` releases the idempotency record of an event that
 *     failed after claiming it, so the provider's redelivery of the same event
 *     id is applied instead of being swallowed as a duplicate - while an event
 *     that was applied stays deduplicated.
 *  2. The route answers non-2xx when the status application failed, so Didit
 *     redelivers the event at all.
 */

type WebhookEventRow = { event_id: string; processing_result: string; user_id: string | null }

interface FakeState {
	events: Map<string, WebhookEventRow>
	sessionUserId: string | null
	sessionStatus: string
	sessionUpdateError: { message: string } | null
	sessionUpdates: number
	upsertShouldThrow: boolean
	transitions: number
	pollarActivations: number
}

const state: FakeState = {
	events: new Map<string, WebhookEventRow>(),
	sessionUserId: 'user-1',
	sessionStatus: 'pending',
	sessionUpdateError: null,
	sessionUpdates: 0,
	upsertShouldThrow: false,
	transitions: 0,
	pollarActivations: 0,
}

const resetState = () => {
	state.events = new Map<string, WebhookEventRow>()
	state.sessionUserId = 'user-1'
	state.sessionStatus = 'pending'
	state.sessionUpdateError = null
	state.sessionUpdates = 0
	state.upsertShouldThrow = false
	state.transitions = 0
	state.pollarActivations = 0
}

interface ChainRequest {
	filters: Array<[string, unknown]>
	selected: boolean
}

/** Minimal thenable stand-in for a Supabase query builder. */
const makeBuilder = (effect: (req: ChainRequest) => Promise<unknown>) => {
	const req: ChainRequest = { filters: [], selected: false }
	const builder: Record<string, unknown> = {}
	builder.eq = (column: string, value: unknown) => {
		req.filters.push([column, value])
		return builder
	}
	builder.or = () => builder
	builder.select = () => {
		req.selected = true
		return builder
	}
	builder.maybeSingle = () => effect(req)
	builder.then = (onFulfilled: unknown, onRejected: unknown) =>
		(effect(req) as Promise<unknown>).then(
			onFulfilled as (value: unknown) => unknown,
			onRejected as (reason: unknown) => unknown,
		)
	return builder
}

const fakeClient = {
	from: (table: string) => ({
		insert: (row: Record<string, unknown>) =>
			makeBuilder(async () => {
				if (table === 'webhook_events') {
					const eventId = String(row.event_id)
					if (state.events.has(eventId)) {
						return { error: { code: '23505', message: 'duplicate key value violates unique constraint' } }
					}
					state.events.set(eventId, {
						event_id: eventId,
						processing_result: String(row.processing_result),
						user_id: (row.user_id as string | null) ?? null,
					})
					return { error: null }
				}
				return { error: null }
			}),
		update: (patch: Record<string, unknown>) =>
			makeBuilder(async (req) => {
				if (table === 'webhook_events') {
					const eventId = req.filters.find(([column]) => column === 'event_id')?.[1]
					const row = eventId ? state.events.get(String(eventId)) : undefined
					if (!row) return { error: null, data: req.selected ? [] : null }
					const matchAll = req.filters.every(([column, value]) => {
						if (column === 'event_id') return row.event_id === value
						if (column === 'processing_result') return row.processing_result === value
						return true
					})
					if (!matchAll) return { error: null, data: req.selected ? [] : null }
					row.processing_result = String(patch.processing_result)
					return { error: null, data: req.selected ? [row] : null }
				}
				if (table === 'didit_sessions') {
					if (state.sessionUpdateError) return { error: state.sessionUpdateError }
					state.sessionUpdates += 1
					return { error: null, data: req.selected ? [{ session_id: 'session-1' }] : null }
				}
				return { error: null, data: req.selected ? [] : null }
			}),
		select: () =>
			makeBuilder(async (req) => {
				if (table === 'webhook_events') {
					const eventId = req.filters.find(([column]) => column === 'event_id')?.[1]
					const row = eventId ? state.events.get(String(eventId)) : undefined
					return { error: null, data: row ?? null }
				}
				return { error: null, data: null }
			}),
	}),
}

mock.module('@/lib/logger', () => ({
	logger: {
		error: mock(() => undefined),
		warn: mock(() => undefined),
		info: mock(() => undefined),
	},
}))

mock.module('../lib/kyc/supabase-kyc-client', () => ({
	getKycSchemaClient: () => fakeClient,
}))

mock.module('../lib/kyc/session-service', () => ({
	findDiditSessionBySessionId: mock(async () =>
		state.sessionUserId
			? {
					id: 'session-row-1',
					userId: state.sessionUserId,
					kycReviewId: 'review-1',
					sessionId: 'session-1',
					verificationUrl: null,
					diditStatus: 'In Progress',
					canonicalStatus: state.sessionStatus,
					lastProviderEventId: null,
					lastProviderEventAt: '2026-08-25T10:00:00.000Z',
				}
			: null,
	),
	upsertKycReviewStatus: mock(async () => {
		if (state.upsertShouldThrow) throw new Error('review upsert exploded')
		return 'review-1'
	}),
	recordKycStatusTransition: mock(async () => {
		state.transitions += 1
	}),
	activatePollarIfApproved: mock(async () => {
		state.pollarActivations += 1
	}),
}))

mock.module('next/server', () => ({
	NextResponse: {
		json: (body: unknown, init?: { status?: number }) => ({
			body,
			status: init?.status ?? 200,
		}),
	},
}))

mock.module('~/lib/services/didit', () => ({
	verifyDiditWebhookSignatureV2: () => true,
	verifyDiditWebhookSignatureSimple: () => true,
}))

const { applyDiditStatusUpdate } = await import('../lib/kyc/webhook-service')
const { POST } = await import('../app/api/kyc/didit/webhook/route')

const applyEvent = (eventId: string, diditStatus = 'In Progress') =>
	applyDiditStatusUpdate({
		sessionId: 'session-1',
		diditStatus,
		source: 'webhook',
		eventId,
		providerEventAt: new Date('2026-08-25T11:00:00.000Z'),
	})

const webhookRequest = (payload: Record<string, unknown>) =>
	({
		text: async () => JSON.stringify(payload),
		headers: {
			get: (name: string) =>
				({
					'x-signature-simple': 'signature',
					'x-timestamp': '1787654400',
				})[name] ?? null,
		},
	}) as never

beforeEach(() => {
	resetState()
	process.env.DIDIT_WEBHOOK_SECRET_KEY = 'test-webhook-secret'
})

describe('applyDiditStatusUpdate retryability', () => {
	test('applies an event and deduplicates the second delivery of the same event id', async () => {
		const first = await applyEvent('evt-applied')
		const second = await applyEvent('evt-applied')

		expect(first).toEqual({ applied: true, canonicalStatus: 'pending', userId: 'user-1' })
		expect(second).toEqual({
			applied: false,
			reason: 'duplicate',
			canonicalStatus: 'pending',
			userId: 'user-1',
		})
		expect(state.sessionUpdates).toBe(1)
		expect(state.events.get('evt-applied')?.processing_result).toBe('applied')
	})

	test('releases a failed event so a redelivery of the same event id is applied', async () => {
		state.sessionUpdateError = { message: 'connection reset by peer' }

		const failed = await applyEvent('evt-retry')
		expect(failed).toEqual({
			applied: false,
			reason: 'error',
			canonicalStatus: 'pending',
			userId: 'user-1',
		})
		expect(state.events.get('evt-retry')?.processing_result).toBe('error')

		state.sessionUpdateError = null
		const retried = await applyEvent('evt-retry')
		expect(retried).toEqual({ applied: true, canonicalStatus: 'pending', userId: 'user-1' })
		expect(state.events.get('evt-retry')?.processing_result).toBe('applied')
		expect(state.sessionUpdates).toBe(1)

		const third = await applyEvent('evt-retry')
		expect(third.applied).toBe(false)
		if (third.applied === false) expect(third.reason).toBe('duplicate')
	})

	test('releases the claim when the status application throws unexpectedly', async () => {
		state.upsertShouldThrow = true

		const failed = await applyEvent('evt-throw')
		expect(failed.applied).toBe(false)
		if (failed.applied === false) expect(failed.reason).toBe('error')
		expect(state.events.get('evt-throw')?.processing_result).toBe('error')

		state.upsertShouldThrow = false
		const retried = await applyEvent('evt-throw')
		expect(retried.applied).toBe(true)
	})

	test('reclaims a failed record exactly once when two redeliveries race', async () => {
		state.events.set('evt-race', {
			event_id: 'evt-race',
			processing_result: 'error',
			user_id: 'user-1',
		})

		const results = await Promise.all([applyEvent('evt-race'), applyEvent('evt-race')])
		const applied = results.filter((result) => result.applied)
		const duplicates = results.filter(
			(result) => !result.applied && result.reason === 'duplicate',
		)

		expect(applied.length).toBe(1)
		expect(duplicates.length).toBe(1)
		expect(state.sessionUpdates).toBe(1)
		expect(state.events.get('evt-race')?.processing_result).toBe('applied')
	})

	test('records a delivery it cannot attribute to a user as retryable', async () => {
		state.sessionUserId = null

		const unattributed = await applyEvent('evt-orphan')
		expect(unattributed).toEqual({ applied: false, reason: 'not_found' })
		expect(state.events.get('evt-orphan')?.processing_result).toBe('error')
		expect(state.events.get('evt-orphan')?.user_id).toBeNull()

		state.sessionUserId = 'user-1'
		const linked = await applyEvent('evt-orphan')
		expect(linked.applied).toBe(true)
		expect(state.events.get('evt-orphan')?.processing_result).toBe('applied')
	})
})

describe('POST /api/kyc/didit/webhook', () => {
	test('answers 500 when the status application fails so the provider retries', async () => {
		state.sessionUpdateError = { message: 'connection reset by peer' }

		const response = (await POST(
			webhookRequest({ session_id: 'session-1', status: 'In Progress', webhook_id: 'evt-route' }),
		)) as unknown as { status: number; body: Record<string, unknown> }

		expect(response.status).toBe(500)
		expect(response.body).toEqual({ received: false, error: 'Webhook processing failed' })
		expect(state.events.get('evt-route')?.processing_result).toBe('error')
	})

	test('answers 500 and keeps the event retryable when the pipeline throws', async () => {
		state.upsertShouldThrow = true

		const response = (await POST(
			webhookRequest({
				session_id: 'session-1',
				status: 'In Progress',
				webhook_id: 'evt-route-throw',
			}),
		)) as unknown as { status: number; body: Record<string, unknown> }

		expect(response.status).toBe(500)
		expect(response.body).toEqual({ received: false, error: 'Webhook processing failed' })
	})

	test('answers 200 and applies the event on a healthy delivery', async () => {
		const response = (await POST(
			webhookRequest({ session_id: 'session-1', status: 'In Progress', webhook_id: 'evt-ok' }),
		)) as unknown as { status: number; body: Record<string, unknown> }

		expect(response.status).toBe(200)
		expect(response.body).toEqual({ received: true })
		expect(state.events.get('evt-ok')?.processing_result).toBe('applied')
	})

	test('answers 200 for a redelivery of an already applied event', async () => {
		await POST(
			webhookRequest({ session_id: 'session-1', status: 'In Progress', webhook_id: 'evt-twice' }),
		)
		const response = (await POST(
			webhookRequest({ session_id: 'session-1', status: 'In Progress', webhook_id: 'evt-twice' }),
		)) as unknown as { status: number }

		expect(response.status).toBe(200)
		expect(state.sessionUpdates).toBe(1)
	})
})
