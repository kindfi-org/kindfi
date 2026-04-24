import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'

// audit_logs table is not in generated Supabase types
const AUDIT_LOGS_TABLE = 'audit_logs' as const

export type AuditOperation =
	| 'escrow.initialize'
	| 'escrow.fund'
	| 'escrow.fund.update'
	| 'escrow.review'
	| 'escrow.sign_and_submit'
	| 'escrow.dispute.create'
	| 'escrow.dispute.sign'
	| 'escrow.dispute.resolve'
	| 'escrow.dispute.assign_mediator'
	| 'nft.mint'
	| 'nft.evolve'

export type AuditResourceType =
	| 'escrow'
	| 'transaction'
	| 'milestone'
	| 'dispute'
	| 'nft'

export type AuditStatus =
	| 'initiated'
	| 'success'
	| 'failure'
	| 'validation_error'

export interface AuditLogEntry {
	timestamp: string
	correlationId: string
	operation: AuditOperation
	resourceType: AuditResourceType
	resourceId?: string
	actorId?: string
	status: AuditStatus
	metadata?: Record<string, unknown>
	errorCode?: string
	durationMs?: number
}

export interface AuditLogParams {
	correlationId: string
	operation: AuditOperation
	resourceType: AuditResourceType
	resourceId?: string
	actorId?: string
	status: AuditStatus
	metadata?: Record<string, unknown>
	errorCode?: string
	durationMs?: number
}

export class AuditLogger {
	/**
	 * Masks a wallet/Stellar address for PII safety.
	 * Shows first 4 and last 4 characters: "GABCD***WXYZ"
	 */
	static maskAddress(address: string): string {
		if (!address || address.length <= 8) return address
		return `${address.slice(0, 4)}***${address.slice(-4)}`
	}

	/**
	 * Logs an audit event to console and persists to the audit_logs table.
	 * Never throws — catches DB errors to avoid disrupting the main flow.
	 */
	async log(params: AuditLogParams): Promise<void> {
		const entry: AuditLogEntry = {
			timestamp: new Date().toISOString(),
			correlationId: params.correlationId,
			operation: params.operation,
			resourceType: params.resourceType,
			resourceId: params.resourceId,
			actorId: params.actorId,
			status: params.status,
			metadata: params.metadata,
			errorCode: params.errorCode,
			durationMs: params.durationMs,
		}

		// Always emit structured JSON to console
		console.info('[AUDIT]', JSON.stringify(entry))

		try {
			const supabase = createSupabaseBrowserClient()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- audit_logs not in generated types
			const { error } = await (supabase as any)
				.from(AUDIT_LOGS_TABLE)
				.insert({
					correlation_id: params.correlationId,
					operation: params.operation,
					resource_type: params.resourceType,
					resource_id: params.resourceId,
					actor_id: params.actorId,
					status: params.status,
					metadata: params.metadata ?? {},
					error_code: params.errorCode,
					duration_ms: params.durationMs,
				})

			if (error) throw error
		} catch (dbError) {
			console.error('[AuditLogger] Failed to persist audit log:', dbError)
			// Don't throw to avoid disrupting the main flow
		}
	}
}
