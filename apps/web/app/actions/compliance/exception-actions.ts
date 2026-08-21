'use server'

import { revalidatePath } from 'next/cache'
import { toServerActionFailure, validateInput } from '~/lib/auth/server-action-auth'
import { requireComplianceAdmin } from '~/lib/compliance/admin-guard'
import { createException, revokeException } from '~/lib/compliance/policy-service'
import {
	createExceptionInputSchema,
	revokeExceptionInputSchema,
} from '~/lib/schemas/compliance.schemas'

export type ComplianceActionResult = { success: true } | { success: false; error: string }

/**
 * Creates a time-limited exception. Enforces separation of duties: an admin
 * cannot approve their own exception request. `approverUserId`, when
 * provided, must differ from the acting compliance admin — this is a basic
 * check, not a full multi-party approval workflow.
 */
export async function createExceptionAction(
	input: unknown,
): Promise<ComplianceActionResult & { exceptionId?: string }> {
	try {
		const admin = await requireComplianceAdmin('createException')
		const validated = validateInput(createExceptionInputSchema, input, 'createException')

		if (validated.approverUserId && validated.approverUserId === admin.userId) {
			return {
				success: false,
				error: 'Separation of duties: you cannot approve your own exception request.',
			}
		}

		const result = await createException({
			userId: validated.userId,
			action: validated.action,
			policyId: validated.policyId,
			reason: validated.reason,
			requestedBy: admin.userId,
			approvedBy: validated.approverUserId ?? null,
			expiresAt: validated.expiresAt,
		})

		if (!result.success) return result

		revalidatePath('/admin/compliance')
		return { success: true, exceptionId: result.exceptionId }
	} catch (error) {
		return toServerActionFailure(error, 'Failed to create exception')
	}
}

export async function revokeExceptionAction(input: unknown): Promise<ComplianceActionResult> {
	try {
		const admin = await requireComplianceAdmin('revokeException')
		const validated = validateInput(revokeExceptionInputSchema, input, 'revokeException')

		const result = await revokeException(validated.exceptionId, admin.userId, validated.reason)
		if (!result.success) return result

		revalidatePath('/admin/compliance')
		return { success: true }
	} catch (error) {
		return toServerActionFailure(error, 'Failed to revoke exception')
	}
}
