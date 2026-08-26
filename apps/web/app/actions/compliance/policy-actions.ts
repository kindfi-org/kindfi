'use server'

import { revalidatePath } from 'next/cache'
import { toServerActionFailure, validateInput } from '~/lib/auth/server-action-auth'
import { requireComplianceAdmin } from '~/lib/compliance/admin-guard'
import {
	activatePolicy,
	createDraftPolicy,
	disableActivePolicy,
	rollBackToPolicyVersion,
} from '~/lib/compliance/policy-service'
import {
	createDraftPolicyInputSchema,
	policyActionInputSchema,
} from '~/lib/schemas/compliance.schemas'

export type ComplianceActionResult = { success: true } | { success: false; error: string }

export async function createDraftPolicyAction(
	input: unknown,
): Promise<ComplianceActionResult & { policyId?: string }> {
	try {
		const admin = await requireComplianceAdmin('createDraftPolicy')
		const validated = validateInput(createDraftPolicyInputSchema, input, 'createDraftPolicy')

		const result = await createDraftPolicy({
			name: validated.name,
			reason: validated.reason,
			policyReference: validated.policyReference,
			effectiveStart: validated.effectiveStart,
			effectiveEnd: validated.effectiveEnd,
			createdBy: admin.userId,
			countryRules: validated.countryRules,
			actions: validated.actions,
		})

		if (!result.success) return result

		revalidatePath('/admin/compliance')
		return { success: true, policyId: result.policy.id }
	} catch (error) {
		return toServerActionFailure(error, 'Failed to create draft policy')
	}
}

export async function activatePolicyAction(input: unknown): Promise<ComplianceActionResult> {
	try {
		const admin = await requireComplianceAdmin('activatePolicy')
		const validated = validateInput(policyActionInputSchema, input, 'activatePolicy')

		const result = await activatePolicy(validated.policyId, admin.userId, validated.reason)
		if (!result.success) return result

		revalidatePath('/admin/compliance')
		return { success: true }
	} catch (error) {
		return toServerActionFailure(error, 'Failed to activate policy')
	}
}

export async function rollBackPolicyAction(input: unknown): Promise<ComplianceActionResult> {
	try {
		const admin = await requireComplianceAdmin('rollBackPolicy')
		const validated = validateInput(policyActionInputSchema, input, 'rollBackPolicy')

		const result = await rollBackToPolicyVersion(validated.policyId, admin.userId, validated.reason)
		if (!result.success) return result

		revalidatePath('/admin/compliance')
		return { success: true }
	} catch (error) {
		return toServerActionFailure(error, 'Failed to roll back policy')
	}
}

export async function disablePolicyAction(input: unknown): Promise<ComplianceActionResult> {
	try {
		const admin = await requireComplianceAdmin('disablePolicy')
		const validated = validateInput(
			policyActionInputSchema.pick({ reason: true }),
			input,
			'disablePolicy',
		)

		const result = await disableActivePolicy(admin.userId, validated.reason)
		if (!result.success) return result

		revalidatePath('/admin/compliance')
		return { success: true }
	} catch (error) {
		return toServerActionFailure(error, 'Failed to disable enforcement')
	}
}
