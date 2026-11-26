import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'

export type AdminAuditOperation =
	| 'admin_milestone_review_approved'
	| 'admin_milestone_review_rejected'
	| 'admin_project_status_changed'
	| 'admin_gamification_triggered'
	| 'admin_quest_backfill_run'
	| 'admin_governance_round_created'
	| 'admin_escrow_synced'

export type AdminAuditResourceType =
	| 'project'
	| 'escrow'
	| 'milestone'
	| 'user'
	| 'governance_round'
	| 'quest'
	| 'gamification_module'

export interface AdminAuditEntry {
	operation: AdminAuditOperation
	resourceType: AdminAuditResourceType
	resourceId: string
	/** The admin performing the action. */
	actorId: string
	status: 'success' | 'failure'
	previousState?: string | null
	newState?: string | null
	txHash?: string | null
	/** Short failure description — never raw errors with secrets. */
	failureReason?: string | null
	/** Additional non-sensitive details. */
	details?: Record<string, unknown>
}

export function buildAdminAuditRow(entry: AdminAuditEntry) {
	return {
		correlation_id: crypto.randomUUID(),
		operation: entry.operation,
		resource_type: entry.resourceType,
		resource_id: entry.resourceId,
		actor_id: entry.actorId,
		status: entry.status,
		error_code: entry.status === 'failure' ? (entry.failureReason ?? 'unknown') : null,
		metadata: {
			...(entry.details ?? {}),
			...(entry.previousState !== undefined ? { previous_state: entry.previousState } : {}),
			...(entry.newState !== undefined ? { new_state: entry.newState } : {}),
			...(entry.txHash ? { tx_hash: entry.txHash } : {}),
		},
	}
}

/**
 * Append-only audit trail for consequential admin actions, written to
 * `public.audit_logs` with the server-only service-role client.
 *
 * The table is readable by any authenticated user under its current RLS
 * policy, so entries must stay free of secrets and PII: record ids, status
 * transitions, and transaction hashes only — never emails, KYC data,
 * private keys, or raw provider payloads.
 *
 * Never throws: a failed audit write must not block the admin action it
 * describes (the failure is logged server-side instead).
 */
export async function recordAdminAudit(entry: AdminAuditEntry): Promise<void> {
	try {
		const { error } = await supabaseServiceRole.from('audit_logs').insert(buildAdminAuditRow(entry))
		if (error) throw error
	} catch (err) {
		logger.error('[admin-audit] Failed to record audit entry', {
			operation: entry.operation,
			resourceType: entry.resourceType,
			error: err instanceof Error ? err.message : String(err),
		})
	}
}
