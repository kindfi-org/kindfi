import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Account, Asset, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'

function jsonResponse(body: unknown, init?: { status?: number }) {
	return {
		status: init?.status ?? 200,
		json: async () => body,
	}
}

mock.module('next/server', () => ({
	NextResponse: { json: jsonResponse },
}))

mock.module('@/lib/logger', () => ({
	logger: { warn: () => {}, error: () => {}, info: () => {} },
}))

mock.module('~/lib/middleware/rate-limit', () => ({
	withRateLimit: (_config: unknown, handler: (req: NextRequest) => Promise<unknown>) => handler,
}))

const mockGetServerSession = mock(async () => ({ user: { id: 'user-1' } }) as unknown)
mock.module('next-auth', () => ({ getServerSession: mockGetServerSession }))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))

const mockRequireKyc = mock(async (_input: unknown) => ({
	ok: true,
	result: {
		allowed: true,
		enforced: false,
		mode: 'disabled',
		currentKycStatus: 'not_started',
		policyResult: 'allow',
		reasonCode: 'disabled',
	},
}))
mock.module('~/lib/kyc/denial', () => ({
	requireKycAuthorization: mockRequireKyc,
}))

mock.module('~/lib/services/contribution-validation.service', () => ({
	isFundEscrowProxyPath: () => false,
	validateFundEscrowProxyRequest: async () => ({ ok: true, error: null, status: 200 }),
}))

const mockSubmit = mock(async () => ({
	status: 'SUCCESS',
	message: 'submitted',
	hash: 'txhash',
}))
mock.module('~/lib/services/submit-trustless-signed-transaction.service', () => ({
	submitTrustlessSignedTransaction: mockSubmit,
	TrustlessStellarSubmitError: class TrustlessStellarSubmitError extends Error {},
}))

let fetchCalls: string[] = []

const buildSignedPayment = (): string => {
	const source = Keypair.random()
	const account = new Account(source.publicKey(), '1')
	const transaction = new TransactionBuilder(account, {
		fee: '100',
		networkPassphrase: 'Test SDF Network ; September 2015',
	})
		.addOperation(
			Operation.payment({
				destination: Keypair.random().publicKey(),
				asset: Asset.native(),
				amount: '10',
			}),
		)
		.setTimeout(30)
		.build()
	transaction.sign(source)
	return transaction.toXDR()
}

function makeProxyRequest(signedXdr: string): Request {
	return new Request('http://localhost/api/trustless-work/helper/send-transaction', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ signedXdr }),
	})
}

describe('POST /api/trustless-work/helper/send-transaction KYC enforcement', () => {
	beforeEach(() => {
		process.env.TRUSTLESS_WORK_API_KEY = 'server-key'
		delete process.env.TRUSTLESS_WORK_API_URL
		fetchCalls = []
		mockSubmit.mockClear()
		mockGetServerSession.mockClear()
		mockRequireKyc.mockClear()
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			fetchCalls.push(String(input))
			return new Response('{}', { status: 200 })
		}) as typeof fetch
	})

	test('returns 403 before any broadcast when KYC denies the classified action', async () => {
		mockRequireKyc.mockImplementation(async (_input: unknown) => ({
			ok: false,
			response: jsonResponse({ error: 'Identity verification is required' }, { status: 403 }),
		}))
		delete process.env.KYC_ENFORCEMENT_MODE

		const { proxyTrustlessWorkRequest } = await import(
			'~/lib/services/trustless-work-proxy.service'
		)
		const response = await proxyTrustlessWorkRequest(makeProxyRequest(buildSignedPayment()), [
			'helper',
			'send-transaction',
		])

		expect(response.status).toBe(403)
		expect(fetchCalls).toHaveLength(0)
		expect(mockSubmit).not.toHaveBeenCalled()
		expect(mockRequireKyc).toHaveBeenCalledTimes(1)
		const input = mockRequireKyc.mock.calls[0][0] as { userId: string; action: string }
		expect(input.userId).toBe('user-1')
		expect(input.action).toBe('send_assets')
	})

	test('returns 401 without a session when enforcement is enforced', async () => {
		mockGetServerSession.mockImplementation(async () => null)
		process.env.KYC_ENFORCEMENT_MODE = 'enforced'

		const { proxyTrustlessWorkRequest } = await import(
			'~/lib/services/trustless-work-proxy.service'
		)
		const response = await proxyTrustlessWorkRequest(makeProxyRequest(buildSignedPayment()), [
			'helper',
			'send-transaction',
		])

		expect(response.status).toBe(401)
		expect(fetchCalls).toHaveLength(0)
		expect(mockSubmit).not.toHaveBeenCalled()

		mockGetServerSession.mockImplementation(async () => ({ user: { id: 'user-1' } }) as unknown)
	})
})
