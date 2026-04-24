import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

const mockInsert = mock(() => Promise.resolve({ error: null }))
const mockFrom = mock(() => ({ insert: mockInsert }))

mock.module('@packages/lib/supabase-client', () => ({
	createSupabaseBrowserClient: () => ({ from: mockFrom }),
}))

describe('AuditLogger', () => {
	afterEach(() => {
		mockInsert.mockClear()
		mockFrom.mockClear()
	})

	describe('maskAddress', () => {
		test('masks a standard Stellar address', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			const result = AuditLogger.maskAddress(
				'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV',
			)
			expect(result).toBe('GABC***STUV')
		})

		test('returns short strings unchanged', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			expect(AuditLogger.maskAddress('GABCWXYZ')).toBe('GABCWXYZ')
			expect(AuditLogger.maskAddress('SHORT')).toBe('SHORT')
		})

		test('returns empty string unchanged', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			expect(AuditLogger.maskAddress('')).toBe('')
		})
	})

	describe('log', () => {
		test('emits structured JSON to console.info', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			const consoleSpy = spyOn(console, 'info').mockImplementation(
				() => {},
			)

			const logger = new AuditLogger()
			await logger.log({
				correlationId: 'test-123',
				operation: 'escrow.initialize',
				resourceType: 'escrow',
				status: 'success',
			})

			expect(consoleSpy).toHaveBeenCalledTimes(1)
			const args = consoleSpy.mock.calls[0]
			expect(args[0]).toBe('[AUDIT]')
			const parsed = JSON.parse(args[1] as string)
			expect(parsed.correlationId).toBe('test-123')
			expect(parsed.operation).toBe('escrow.initialize')
			expect(parsed.resourceType).toBe('escrow')
			expect(parsed.status).toBe('success')
			expect(parsed.timestamp).toBeDefined()

			consoleSpy.mockRestore()
		})

		test('calls Supabase insert with correct fields', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			spyOn(console, 'info').mockImplementation(() => {})

			const logger = new AuditLogger()
			await logger.log({
				correlationId: 'corr-456',
				operation: 'nft.mint',
				resourceType: 'nft',
				resourceId: 'nft-789',
				actorId: 'user-abc',
				status: 'success',
				metadata: { tier: 'gold' },
				durationMs: 150,
			})

			expect(mockFrom).toHaveBeenCalledWith('audit_logs')
			expect(mockInsert).toHaveBeenCalledTimes(1)

			const insertArg = mockInsert.mock.calls[0][0]
			expect(insertArg.correlation_id).toBe('corr-456')
			expect(insertArg.operation).toBe('nft.mint')
			expect(insertArg.resource_type).toBe('nft')
			expect(insertArg.resource_id).toBe('nft-789')
			expect(insertArg.actor_id).toBe('user-abc')
			expect(insertArg.status).toBe('success')
			expect(insertArg.metadata).toEqual({ tier: 'gold' })
			expect(insertArg.duration_ms).toBe(150)

			spyOn(console, 'info').mockRestore()
		})

		test('does not throw when Supabase insert fails', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			spyOn(console, 'info').mockImplementation(() => {})
			const errorSpy = spyOn(console, 'error').mockImplementation(
				() => {},
			)

			mockInsert.mockImplementationOnce(() =>
				Promise.resolve({ error: new Error('DB down') }),
			)

			const logger = new AuditLogger()
			// Should not throw
			await logger.log({
				correlationId: 'corr-err',
				operation: 'escrow.fund',
				resourceType: 'transaction',
				status: 'failure',
			})

			expect(errorSpy).toHaveBeenCalled()
			const errorArgs = errorSpy.mock.calls[0]
			expect(errorArgs[0]).toContain('[AuditLogger]')

			spyOn(console, 'info').mockRestore()
			errorSpy.mockRestore()
		})

		test('includes all fields in the log entry', async () => {
			const { AuditLogger } = await import(
				'../lib/services/audit-logger'
			)
			const consoleSpy = spyOn(console, 'info').mockImplementation(
				() => {},
			)

			const logger = new AuditLogger()
			await logger.log({
				correlationId: 'corr-full',
				operation: 'escrow.dispute.create',
				resourceType: 'dispute',
				resourceId: 'disp-1',
				actorId: 'user-1',
				status: 'failure',
				metadata: { reason: 'timeout' },
				errorCode: 'TIMEOUT',
				durationMs: 5000,
			})

			const parsed = JSON.parse(consoleSpy.mock.calls[0][1] as string)
			expect(parsed.correlationId).toBe('corr-full')
			expect(parsed.operation).toBe('escrow.dispute.create')
			expect(parsed.resourceType).toBe('dispute')
			expect(parsed.resourceId).toBe('disp-1')
			expect(parsed.actorId).toBe('user-1')
			expect(parsed.status).toBe('failure')
			expect(parsed.metadata).toEqual({ reason: 'timeout' })
			expect(parsed.errorCode).toBe('TIMEOUT')
			expect(parsed.durationMs).toBe(5000)

			consoleSpy.mockRestore()
		})
	})
})
