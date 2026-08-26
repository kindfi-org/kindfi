import { describe, expect, test } from 'bun:test'
import { buildAdminAuditRow } from '~/lib/services/admin-audit'

describe('buildAdminAuditRow', () => {
	test('maps a successful state change with previous and new state', () => {
		const row = buildAdminAuditRow({
			operation: 'admin_project_status_changed',
			resourceType: 'project',
			resourceId: 'project-1',
			actorId: 'admin-1',
			status: 'success',
			previousState: 'review',
			newState: 'active',
		})

		expect(row.operation).toBe('admin_project_status_changed')
		expect(row.resource_type).toBe('project')
		expect(row.resource_id).toBe('project-1')
		expect(row.actor_id).toBe('admin-1')
		expect(row.status).toBe('success')
		expect(row.error_code).toBeNull()
		expect(row.metadata).toEqual({ previous_state: 'review', new_state: 'active' })
		expect(row.correlation_id).toMatch(/^[0-9a-f-]{36}$/)
	})

	test('records tx hashes for blockchain operations', () => {
		const row = buildAdminAuditRow({
			operation: 'admin_gamification_triggered',
			resourceType: 'gamification_module',
			resourceId: 'streak',
			actorId: 'admin-1',
			status: 'success',
			txHash: 'abc123',
			details: { action: 'record_donation', network: 'testnet' },
		})

		expect(row.metadata).toEqual({
			action: 'record_donation',
			network: 'testnet',
			tx_hash: 'abc123',
		})
	})

	test('failures carry a short reason in error_code', () => {
		const row = buildAdminAuditRow({
			operation: 'admin_escrow_synced',
			resourceType: 'escrow',
			resourceId: 'CCONTRACT',
			actorId: 'admin-1',
			status: 'failure',
			failureReason: 'Indexer returned no escrow',
		})

		expect(row.status).toBe('failure')
		expect(row.error_code).toBe('Indexer returned no escrow')
	})

	test('omits absent optional fields from metadata', () => {
		const row = buildAdminAuditRow({
			operation: 'admin_quest_backfill_run',
			resourceType: 'quest',
			resourceId: 'all',
			actorId: 'admin-1',
			status: 'success',
		})

		expect(row.metadata).toEqual({})
		expect(Object.keys(row.metadata)).not.toContain('tx_hash')
	})
})
