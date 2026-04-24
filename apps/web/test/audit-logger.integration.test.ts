import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'

// ===== Environment =====
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXTAUTH_SECRET = 'test-secret'

// ===== Mutable mock state (configured per test in beforeEach) =====
let mockDbResults: Record<string, any> = {}
let mockSession: any = null

// ===== Module mocks =====

// Audit logger's Supabase client — captures audit_logs inserts
const mockAuditInsert = mock(() => Promise.resolve({ error: null }))
mock.module('@packages/lib/supabase-client', () => ({
	createSupabaseBrowserClient: () => ({
		from: () => ({ insert: mockAuditInsert }),
	}),
}))

// Main Supabase client — chainable mock driven by mockDbResults
function createChain(result: any) {
	const chain: any = {}
	for (const m of [
		'select', 'insert', 'update', 'delete', 'eq', 'neq',
		'in', 'not', 'order', 'limit', 'range', 'is', 'maybeSingle',
	]) {
		chain[m] = () => createChain(result)
	}
	chain.single = () => Promise.resolve(result)
	chain.then = (res: any, rej?: any) => Promise.resolve(result).then(res, rej)
	chain.catch = (fn: any) => Promise.resolve(result).catch(fn)
	return chain
}

mock.module('@packages/lib/supabase', () => ({
	supabase: {
		from: (table: string) =>
			createChain(mockDbResults[table] ?? { data: null, error: null }),
		auth: {
			getUser: () =>
				Promise.resolve({
					data: { user: { id: 'test-user' } },
					error: null,
				}),
		},
	},
}))

// next/server — minimal mock providing NextResponse.json and no-op after()
mock.module('next/server', () => ({
	NextResponse: {
		json: (body: any, init?: any) =>
			new Response(JSON.stringify(body), {
				status: init?.status ?? 200,
				headers: { 'Content-Type': 'application/json' },
			}),
	},
	after: () => {},
}))

// next-auth
mock.module('next-auth', () => ({
	getServerSession: () => Promise.resolve(mockSession),
}))
mock.module('~/lib/auth/auth-options', () => ({ nextAuthOption: {} }))

// Stellar utils
const mockCreateEscrow = mock(() =>
	Promise.resolve({ unsignedTransaction: 'mock-xdr' }),
)
const mockSendTx = mock(() =>
	Promise.resolve({
		txHash: 'mock-tx-hash',
		contract_id: 'CABC123XYZ',
		escrow: { engagementId: 'eng-1', amount: '100', platformFee: '5' },
	}),
)
mock.module('~/lib/stellar/utils/create-escrow', () => ({
	createEscrowRequest: mockCreateEscrow,
}))
mock.module('~/lib/stellar/utils/send-transaction', () => ({
	sendTransaction: mockSendTx,
}))

// Validation
const mockValidateReq = mock(() => ({ success: true, data: {} }))
mock.module('~/lib/utils/validation', () => ({
	validateRequest: mockValidateReq,
}))

const mockValidateMediatorAssign = mock(() => ({
	success: true,
	data: { disputeId: 'disp-1', mediatorId: 'med-1' },
}))
mock.module('~/lib/validators/dispute', () => ({
	validateMediatorAssignment: mockValidateMediatorAssign,
	validateDispute: mock(() => ({ success: true, data: {} })),
	validateDisputeSign: mock(() => ({ success: true, data: {} })),
	validateDisputeResolution: mock(() => ({ success: true, data: {} })),
}))

// Schemas (objects only, actual validation is mocked via validateRequest)
mock.module('~/lib/schemas/escrow.schemas', () => ({
	escrowInitializeSchema: {},
	escrowFundSchema: {},
	escrowFundUpdateSchema: {},
	milestoneReviewSchema: {},
}))
mock.module('~/lib/schemas/escrow-sign.schemas', () => ({
	signAndSubmitSchema: {},
}))
mock.module('~/lib/schemas/escrow-dispute.schemas', () => ({
	listDisputesQuerySchema: {},
}))

// Type-only modules (ensure module resolution works at runtime)
mock.module('@services/supabase', () => ({}))

// ===== Helpers =====

function createRequest(body: any) {
	return new Request('http://localhost/api/test', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' },
	})
}

/** Finds the first [AUDIT] call in console.info spy and parses its JSON payload */
function getAuditEntry(spy: ReturnType<typeof spyOn>): any | null {
	for (const call of spy.mock.calls) {
		if (call[0] === '[AUDIT]') {
			return JSON.parse(call[1] as string)
		}
	}
	return null
}

/** Returns the first argument passed to the audit_logs Supabase insert */
function getAuditDbRow(): any | null {
	if (mockAuditInsert.mock.calls.length > 0) {
		return mockAuditInsert.mock.calls[0][0]
	}
	return null
}

// =============================================================================
// POST /api/escrow/initialize
// =============================================================================

describe('Audit logging integration — POST /api/escrow/initialize', () => {
	let infoSpy: ReturnType<typeof spyOn>
	let errorSpy: ReturnType<typeof spyOn>

	beforeEach(() => {
		infoSpy = spyOn(console, 'info').mockImplementation(() => {})
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
		mockAuditInsert.mockClear()
		mockCreateEscrow.mockClear()
		mockSendTx.mockClear()
		mockValidateReq.mockImplementation(() => ({
			success: true,
			data: {},
		}))
		mockDbResults = {
			escrow_contracts: { data: { id: 'esc-123' }, error: null },
		}
	})

	afterEach(() => {
		infoSpy.mockRestore()
		errorSpy.mockRestore()
	})

	test('emits validation_error audit log on invalid input', async () => {
		mockValidateReq.mockReturnValueOnce({
			success: false,
			response: new Response(JSON.stringify({ error: 'Invalid' }), {
				status: 400,
			}),
		})

		const { POST } = await import('../app/api/escrow/initialize/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(400)

		const entry = getAuditEntry(infoSpy)
		expect(entry).not.toBeNull()
		expect(entry.operation).toBe('escrow.initialize')
		expect(entry.status).toBe('validation_error')
		expect(entry.resourceType).toBe('escrow')
		expect(entry.correlationId).toContain('audit-')
		expect(typeof entry.durationMs).toBe('number')
	})

	test('emits success audit log with resourceId on successful initialization', async () => {
		const { POST } = await import('../app/api/escrow/initialize/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(201)

		// Verify console audit entry
		const entry = getAuditEntry(infoSpy)
		expect(entry).not.toBeNull()
		expect(entry.operation).toBe('escrow.initialize')
		expect(entry.status).toBe('success')
		expect(entry.resourceId).toBe('esc-123')
		expect(entry.metadata.contractAddress).toBe('CABC123XYZ')

		// Verify Supabase persistence
		const dbRow = getAuditDbRow()
		expect(dbRow).not.toBeNull()
		expect(dbRow.correlation_id).toContain('audit-')
		expect(dbRow.operation).toBe('escrow.initialize')
		expect(dbRow.status).toBe('success')
		expect(dbRow.resource_id).toBe('esc-123')
	})

	test('emits failure audit log when external API throws', async () => {
		mockCreateEscrow.mockImplementationOnce(() => {
			throw new Error('Stellar API unreachable')
		})

		const { POST } = await import('../app/api/escrow/initialize/route')
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(500)

		const entry = getAuditEntry(infoSpy)
		expect(entry).not.toBeNull()
		expect(entry.operation).toBe('escrow.initialize')
		expect(entry.status).toBe('failure')
		expect(entry.errorCode).toBe('500')
		expect(entry.metadata.error).toContain('Stellar API unreachable')
	})
})

// =============================================================================
// POST /api/escrow/dispute/assign
// =============================================================================

describe('Audit logging integration — POST /api/escrow/dispute/assign', () => {
	let infoSpy: ReturnType<typeof spyOn>
	let errorSpy: ReturnType<typeof spyOn>

	beforeEach(() => {
		infoSpy = spyOn(console, 'info').mockImplementation(() => {})
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
		mockAuditInsert.mockClear()
		mockValidateMediatorAssign.mockImplementation(() => ({
			success: true,
			data: { disputeId: 'disp-1', mediatorId: 'med-1' },
		}))
		mockSession = { user: { id: 'admin-user-123' } }
		mockDbResults = {
			escrow_reviews: {
				data: {
					id: 'disp-1',
					status: 'PENDING',
					type: 'dispute',
					escrow_id: 'esc-1',
					milestone_id: 'mil-1',
				},
				error: null,
			},
			users: {
				data: {
					id: 'admin-user-123',
					user_roles: [{ role: 'admin' }],
				},
				error: null,
			},
			notifications: { data: null, error: null },
		}
	})

	afterEach(() => {
		infoSpy.mockRestore()
		errorSpy.mockRestore()
	})

	test('emits validation_error audit log with actorId on invalid data', async () => {
		mockValidateMediatorAssign.mockReturnValueOnce({
			success: false,
			error: { format: () => ({ _errors: ['Invalid disputeId'] }) },
		})

		const { POST } = await import(
			'../app/api/escrow/dispute/assign/route'
		)
		const res = await POST(createRequest({}) as any)

		expect(res.status).toBe(400)

		const entry = getAuditEntry(infoSpy)
		expect(entry).not.toBeNull()
		expect(entry.operation).toBe('escrow.dispute.assign_mediator')
		expect(entry.status).toBe('validation_error')
		expect(entry.actorId).toBe('admin-user-123')
		expect(entry.resourceType).toBe('dispute')
	})

	test('emits success audit log with actorId, resourceId and metadata', async () => {
		const { POST } = await import(
			'../app/api/escrow/dispute/assign/route'
		)
		const res = await POST(
			createRequest({ disputeId: 'disp-1', mediatorId: 'med-1' }) as any,
		)

		expect(res.status).toBe(200)

		// Verify console audit entry
		const entry = getAuditEntry(infoSpy)
		expect(entry).not.toBeNull()
		expect(entry.operation).toBe('escrow.dispute.assign_mediator')
		expect(entry.status).toBe('success')
		expect(entry.actorId).toBe('admin-user-123')
		expect(entry.resourceId).toBe('disp-1')
		expect(entry.metadata.mediatorId).toBe('med-1')

		// Verify Supabase persistence
		const dbRow = getAuditDbRow()
		expect(dbRow).not.toBeNull()
		expect(dbRow.operation).toBe('escrow.dispute.assign_mediator')
		expect(dbRow.actor_id).toBe('admin-user-123')
		expect(dbRow.resource_id).toBe('disp-1')
	})
})

// =============================================================================
// POST /api/escrow/fund/[transactionHash]
// =============================================================================

describe('Audit logging integration — POST /api/escrow/fund/[transactionHash]', () => {
	let infoSpy: ReturnType<typeof spyOn>
	let errorSpy: ReturnType<typeof spyOn>

	beforeEach(() => {
		infoSpy = spyOn(console, 'info').mockImplementation(() => {})
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
		mockAuditInsert.mockClear()
		mockValidateReq.mockImplementation(() => ({
			success: true,
			data: { escrowId: 'esc-1', status: 'PENDING' },
		}))
		mockDbResults = {
			transactions: { data: null, error: null },
		}
	})

	afterEach(() => {
		infoSpy.mockRestore()
		errorSpy.mockRestore()
	})

	test('emits success audit log with transactionHash as resourceId', async () => {
		const { POST } = await import(
			'../app/api/escrow/fund/[transactionHash]/route'
		)
		const res = await POST(createRequest({ escrowId: 'esc-1', status: 'PENDING' }) as any, {
			params: Promise.resolve({ transactionHash: 'tx-abc123' }),
		})

		expect(res.status).toBe(200)

		// Verify console audit entry
		const entry = getAuditEntry(infoSpy)
		expect(entry).not.toBeNull()
		expect(entry.operation).toBe('escrow.fund.update')
		expect(entry.status).toBe('success')
		expect(entry.resourceType).toBe('transaction')
		expect(entry.resourceId).toBe('tx-abc123')
		expect(entry.metadata.escrowId).toBe('esc-1')
		expect(entry.metadata.newStatus).toBe('PENDING')

		// Verify Supabase persistence
		const dbRow = getAuditDbRow()
		expect(dbRow).not.toBeNull()
		expect(dbRow.operation).toBe('escrow.fund.update')
		expect(dbRow.resource_type).toBe('transaction')
		expect(dbRow.resource_id).toBe('tx-abc123')
	})
})
