import { beforeEach, describe, expect, it, mock } from 'bun:test'

/**
 * Issue #1036: a failed Pollar wallet activation after KYC approval must leave
 * recoverable state behind so a retry job or a later read can finish it, instead
 * of being swallowed with the user stuck without an activated wallet forever.
 *
 * The Pollar bridge and the Supabase clients are mocked. Activation is deferred
 * and best-effort: the retry helper must never throw, because a throw would
 * surface as a KYC failure even though the approved status is still valid.
 */

type QueryResult = { data: unknown; error: unknown }

let profileState: QueryResult = { data: null, error: null }
let pendingState: QueryResult = { data: [], error: null }

interface ProfilesChain extends Promise<QueryResult> {
	select: (columns?: string) => ProfilesChain
	eq: (column: string, value: unknown) => ProfilesChain
	not: (column: string, operator: string, value: unknown) => ProfilesChain
	is: (column: string, value: unknown) => ProfilesChain
	order: (column: string, options?: unknown) => ProfilesChain
	limit: (count: number) => ProfilesChain
	maybeSingle: () => Promise<QueryResult>
}

/** Chainable, awaitable stand-in for a Supabase Postgrest filter builder. */
const profilesChain = (): ProfilesChain => {
	const chain = Promise.resolve(pendingState) as ProfilesChain
	chain.select = () => profilesChain()
	chain.eq = () => profilesChain()
	chain.not = () => profilesChain()
	chain.is = () => profilesChain()
	chain.order = () => profilesChain()
	chain.limit = () => profilesChain()
	chain.maybeSingle = async () => profileState
	return chain
}

const pollar = {
	behavior: async (): Promise<void> => {},
	activated: [] as string[],
}

mock.module('@packages/lib/supabase', () => ({
	supabase: { from: () => profilesChain() },
}))

const warnLog = mock(() => undefined)

mock.module('@/lib/logger', () => ({
	logger: { error: () => undefined, warn: warnLog, info: () => undefined },
}))

mock.module('~/lib/logger', () => ({
	logger: { error: () => undefined, warn: warnLog, info: () => undefined },
}))

mock.module('~/lib/kyc/supabase-kyc-client', () => ({
	getKycSchemaClient: () => ({ from: () => profilesChain() }),
}))

mock.module('~/lib/pollar/bridge/link-pollar-user', () => ({
	// Mirrors the real bridge: the activation timestamp is only written once
	// Pollar confirms, so a failed attempt leaves the pending state untouched.
	activatePollarWalletForProfile: async (userId: string) => {
		await pollar.behavior()
		pollar.activated.push(userId)
		profileState = activatedProfile(userId)
	},
}))

const {
	activatePollarIfApproved,
	findPendingPollarWalletActivations,
	isPollarWalletActivationPending,
	retryPollarWalletActivation,
	runPollarWalletActivationRetryJob,
} = await import('~/lib/kyc/session-service')

const walletAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

const pendingProfile = (userId = 'user-1') => ({
	data: { id: userId, pollar_wallet_address: walletAddress, pollar_wallet_activated_at: null },
	error: null,
})

const activatedProfile = (userId = 'user-1') => ({
	data: {
		id: userId,
		pollar_wallet_address: walletAddress,
		pollar_wallet_activated_at: '2026-08-25T00:00:00.000Z',
	},
	error: null,
})

beforeEach(() => {
	profileState = { data: null, error: null }
	pendingState = { data: [], error: null }
	pollar.behavior = async () => {}
	pollar.activated = []
	warnLog.mockClear()
})

describe('isPollarWalletActivationPending', () => {
	it('is true when a Pollar address exists but activation never completed', async () => {
		profileState = pendingProfile()

		expect(await isPollarWalletActivationPending('user-1')).toBe(true)
	})

	it('is false once activation has been recorded', async () => {
		profileState = activatedProfile()

		expect(await isPollarWalletActivationPending('user-1')).toBe(false)
	})

	it('is false for profiles without a Pollar wallet', async () => {
		profileState = {
			data: { id: 'user-1', pollar_wallet_address: null, pollar_wallet_activated_at: null },
			error: null,
		}

		expect(await isPollarWalletActivationPending('user-1')).toBe(false)
	})
})

describe('findPendingPollarWalletActivations', () => {
	it('returns the profiles whose activation is still owed', async () => {
		pendingState = {
			data: [
				{ id: 'user-1', pollar_wallet_address: 'GAAA' },
				{ id: 'user-2', pollar_wallet_address: 'GBBB' },
			],
			error: null,
		}

		expect(await findPendingPollarWalletActivations()).toEqual([
			{ userId: 'user-1', walletAddress: 'GAAA' },
			{ userId: 'user-2', walletAddress: 'GBBB' },
		])
	})

	it('omits rows without a Pollar wallet address', async () => {
		pendingState = { data: [{ id: 'user-1', pollar_wallet_address: null }], error: null }

		expect(await findPendingPollarWalletActivations()).toEqual([])
	})

	it('returns an empty list when the query fails', async () => {
		pendingState = { data: null, error: { message: 'boom' } }

		expect(await findPendingPollarWalletActivations()).toEqual([])
	})
})

describe('retryPollarWalletActivation', () => {
	it('reports not_pending without calling Pollar when nothing is owed', async () => {
		profileState = activatedProfile()

		expect(await retryPollarWalletActivation('user-1')).toEqual({
			userId: 'user-1',
			activated: true,
			reason: 'not_pending',
		})
		expect(pollar.activated).toEqual([])
	})

	it('reports a failure without throwing and leaves the pending state recoverable', async () => {
		profileState = pendingProfile()
		pollar.behavior = async () => {
			throw new Error('Pollar upstream 503')
		}

		expect(await retryPollarWalletActivation('user-1')).toEqual({
			userId: 'user-1',
			activated: false,
			reason: 'activation_failed',
			error: 'Pollar upstream 503',
		})
		// No activation timestamp was written, so a later job or status read can
		// still pick this profile up.
		expect(pollar.activated).toEqual([])
		expect(await isPollarWalletActivationPending('user-1')).toBe(true)
	})

	it('succeeds on a later retry after an earlier failure', async () => {
		profileState = pendingProfile()
		pollar.behavior = async () => {
			throw new Error('Pollar upstream 503')
		}
		expect((await retryPollarWalletActivation('user-1')).activated).toBe(false)

		// Recovery is driven by the pending row itself — no duplicate webhook and
		// no status transition is involved.
		pollar.behavior = async () => {}
		expect(await retryPollarWalletActivation('user-1')).toEqual({
			userId: 'user-1',
			activated: true,
		})
		expect(await isPollarWalletActivationPending('user-1')).toBe(false)
	})
})

describe('runPollarWalletActivationRetryJob', () => {
	it('sweeps pending activations and counts successes and failures', async () => {
		pendingState = {
			data: [
				{ id: 'user-1', pollar_wallet_address: 'GAAA' },
				{ id: 'user-2', pollar_wallet_address: 'GBBB' },
			],
			error: null,
		}
		profileState = pendingProfile()

		let attempts = 0
		pollar.behavior = async () => {
			attempts += 1
			if (attempts === 1) throw new Error('Pollar upstream 503')
		}

		expect(await runPollarWalletActivationRetryJob()).toEqual({
			attempted: 2,
			activated: 1,
			failed: 1,
		})
		expect(attempts).toBe(2)
	})
})

describe('activatePollarIfApproved', () => {
	it('does not attempt activation for a non-approved KYC status', async () => {
		profileState = pendingProfile()

		await activatePollarIfApproved('user-1', 'pending')

		expect(pollar.activated).toEqual([])
	})

	it('keeps the approved KYC status intact when activation fails', async () => {
		profileState = pendingProfile()
		pollar.behavior = async () => {
			throw new Error('Pollar upstream 503')
		}

		// Resolves rather than rejecting: the webhook path must not fail the KYC
		// update because a deferred side effect could not complete.
		await expect(activatePollarIfApproved('user-1', 'approved')).resolves.toBeUndefined()
		expect(warnLog).toHaveBeenCalledTimes(1)
		// The activation is still owed, so the retry job can recover it.
		expect(await isPollarWalletActivationPending('user-1')).toBe(true)
	})
})
