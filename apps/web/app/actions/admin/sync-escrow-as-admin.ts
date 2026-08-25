'use server'

import { syncEscrowToDatabaseAction } from '~/app/actions/escrow/sync-escrow-to-database'
import { requireAdminSession, toServerActionFailure } from '~/lib/auth/server-action-auth'
import { recordAdminAudit } from '~/lib/services/admin-audit'

export interface AdminSyncEscrowResult {
	success: boolean
	error?: string
	alreadySynced?: boolean
}

/**
 * Admin-context wrapper around the existing escrow sync action: verifies
 * platform-admin authorization independently, delegates to
 * syncEscrowToDatabaseAction (which keeps its own auth, validation, and
 * rate limiting), and records an audit entry for the reconciliation.
 */
export async function syncEscrowAsAdminAction(input: {
	projectId: string
	contractId: string
}): Promise<AdminSyncEscrowResult> {
	let adminId: string
	try {
		const session = await requireAdminSession('admin_sync_escrow')
		adminId = session.user.id
	} catch (error) {
		return toServerActionFailure(error) as AdminSyncEscrowResult
	}

	const result = await syncEscrowToDatabaseAction(input)

	void recordAdminAudit({
		operation: 'admin_escrow_synced',
		resourceType: 'escrow',
		resourceId: input.contractId,
		actorId: adminId,
		status: result.success ? 'success' : 'failure',
		failureReason: result.success ? null : (result.error ?? 'Sync failed'),
		details: {
			project_id: input.projectId,
			already_synced: result.alreadySynced ?? false,
		},
	})

	return result
}
