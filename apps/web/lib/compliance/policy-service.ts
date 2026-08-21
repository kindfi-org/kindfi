import { logger } from '@/lib/logger'
import { recordComplianceAuditEvent } from './audit-log'
import { getComplianceSchemaClient } from './supabase-compliance-client'
import type { PolicyStatus, ProtectedAction, RiskLevel } from './types'

export interface PolicyRecord {
	id: string
	version: number
	name: string
	status: PolicyStatus
	reason: string
	policyReference: string
	effectiveStart: string
	effectiveEnd: string | null
	createdBy: string
	activatedBy: string | null
	activatedAt: string | null
	createdAt: string
}

interface PolicyRow {
	id: string
	version: number
	name: string
	status: PolicyStatus
	reason: string
	policy_reference: string
	effective_start: string
	effective_end: string | null
	created_by: string
	activated_by: string | null
	activated_at: string | null
	created_at: string
}

function rowToPolicy(row: PolicyRow): PolicyRecord {
	return {
		id: row.id,
		version: row.version,
		name: row.name,
		status: row.status,
		reason: row.reason,
		policyReference: row.policy_reference,
		effectiveStart: row.effective_start,
		effectiveEnd: row.effective_end,
		createdBy: row.created_by,
		activatedBy: row.activated_by,
		activatedAt: row.activated_at,
		createdAt: row.created_at,
	}
}

async function nextPolicyVersion(): Promise<number> {
	const { data, error } = await getComplianceSchemaClient()
		.from('policies')
		.select('version')
		.order('version', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		logger.error('[compliance] Failed to read latest policy version', { error: error.message })
	}

	return ((data as { version: number } | null)?.version ?? 0) + 1
}

export interface CreateDraftPolicyInput {
	name: string
	reason: string
	policyReference: string
	effectiveStart: string
	effectiveEnd?: string | null
	createdBy: string
	countryRules: Array<{ countryCode: string; riskLevel: RiskLevel }>
	actions: ProtectedAction[]
}

/**
 * Creates a new draft policy version. Never activates it — activation is a
 * separate, explicit step (`activatePolicy`). Draft policies never affect
 * live authorization decisions.
 */
export async function createDraftPolicy(
	input: CreateDraftPolicyInput,
): Promise<{ success: true; policy: PolicyRecord } | { success: false; error: string }> {
	const client = getComplianceSchemaClient()
	const version = await nextPolicyVersion()

	const { data, error } = await client
		.from('policies')
		.insert({
			version,
			name: input.name,
			status: 'draft',
			reason: input.reason,
			policy_reference: input.policyReference,
			effective_start: input.effectiveStart,
			effective_end: input.effectiveEnd ?? null,
			created_by: input.createdBy,
		})
		.select('*')
		.single()

	if (error || !data) {
		logger.error('[compliance] Failed to create draft policy', { error: error?.message })
		return { success: false, error: 'Failed to create draft policy.' }
	}

	const policy = rowToPolicy(data as PolicyRow)

	if (input.countryRules.length > 0) {
		const { error: rulesError } = await client.from('policy_country_rules').insert(
			input.countryRules.map((rule) => ({
				policy_id: policy.id,
				country_code: rule.countryCode.toUpperCase(),
				risk_level: rule.riskLevel,
			})),
		)
		if (rulesError) {
			logger.error('[compliance] Failed to insert policy country rules', {
				error: rulesError.message,
			})
		}
	}

	if (input.actions.length > 0) {
		const { error: actionsError } = await client.from('policy_actions').insert(
			input.actions.map((action) => ({
				policy_id: policy.id,
				action,
			})),
		)
		if (actionsError) {
			logger.error('[compliance] Failed to insert policy actions', {
				error: actionsError.message,
			})
		}
	}

	await recordComplianceAuditEvent({
		eventType: 'policy_created',
		actorId: input.createdBy,
		policyVersion: version,
		reason: input.reason,
		metadata: { policyId: policy.id, policyReference: input.policyReference },
	})

	return { success: true, policy }
}

/**
 * Activates an approved draft policy version. Any currently active policy is
 * moved to `rolled_back` (its history is preserved, not deleted) so there is
 * always at most one active policy.
 */
export async function activatePolicy(
	policyId: string,
	actorId: string,
	reason: string,
): Promise<{ success: true } | { success: false; error: string }> {
	const client = getComplianceSchemaClient()

	const { data: target, error: fetchError } = await client
		.from('policies')
		.select('*')
		.eq('id', policyId)
		.single()

	if (fetchError || !target) {
		return { success: false, error: 'Policy not found.' }
	}

	const policy = rowToPolicy(target as PolicyRow)
	if (policy.status !== 'draft') {
		return { success: false, error: 'Only draft policies can be activated.' }
	}

	const { data: currentActive } = await client
		.from('policies')
		.select('id, version')
		.eq('status', 'active')
		.maybeSingle()

	if (currentActive) {
		const { error: rollbackError } = await client
			.from('policies')
			.update({ status: 'rolled_back', updated_at: new Date().toISOString() })
			.eq('id', (currentActive as { id: string }).id)

		if (rollbackError) {
			logger.error('[compliance] Failed to roll back previous active policy', {
				error: rollbackError.message,
			})
			return { success: false, error: 'Failed to roll back the previously active policy.' }
		}

		await recordComplianceAuditEvent({
			eventType: 'policy_rolled_back',
			actorId,
			policyVersion: (currentActive as { version: number }).version,
			reason: `Superseded by activation of policy version ${policy.version}.`,
		})
	}

	const now = new Date().toISOString()
	const { error: activateError } = await client
		.from('policies')
		.update({ status: 'active', activated_by: actorId, activated_at: now, updated_at: now })
		.eq('id', policyId)

	if (activateError) {
		logger.error('[compliance] Failed to activate policy', { error: activateError.message })
		return { success: false, error: 'Failed to activate policy.' }
	}

	await recordComplianceAuditEvent({
		eventType: 'policy_activated',
		actorId,
		policyVersion: policy.version,
		reason,
		metadata: { policyId },
	})

	return { success: true }
}

/**
 * Rolls back to an earlier approved (previously active) policy version by
 * re-activating it through the same single-active-policy invariant as
 * `activatePolicy`. History for every version is preserved.
 */
export async function rollBackToPolicyVersion(
	policyId: string,
	actorId: string,
	reason: string,
): Promise<{ success: true } | { success: false; error: string }> {
	const client = getComplianceSchemaClient()
	const { data, error } = await client.from('policies').select('status').eq('id', policyId).single()

	if (error || !data) {
		return { success: false, error: 'Policy not found.' }
	}

	if ((data as { status: PolicyStatus }).status !== 'rolled_back') {
		return {
			success: false,
			error: 'Can only roll back to a previously active (rolled_back) policy version.',
		}
	}

	const { error: draftError } = await client
		.from('policies')
		.update({ status: 'draft', updated_at: new Date().toISOString() })
		.eq('id', policyId)

	if (draftError) {
		return { success: false, error: 'Failed to prepare policy version for reactivation.' }
	}

	return activatePolicy(policyId, actorId, reason)
}

/**
 * Disables enforcement without deleting any policy history. The currently
 * active policy (if any) moves to `disabled`; no rows are removed.
 */
export async function disableActivePolicy(
	actorId: string,
	reason: string,
): Promise<{ success: true } | { success: false; error: string }> {
	const client = getComplianceSchemaClient()
	const { data: active, error } = await client
		.from('policies')
		.select('id, version')
		.eq('status', 'active')
		.maybeSingle()

	if (error) {
		return { success: false, error: 'Failed to look up the active policy.' }
	}

	if (!active) {
		return { success: false, error: 'No active policy to disable.' }
	}

	const { error: updateError } = await client
		.from('policies')
		.update({ status: 'disabled', updated_at: new Date().toISOString() })
		.eq('id', (active as { id: string }).id)

	if (updateError) {
		return { success: false, error: 'Failed to disable the active policy.' }
	}

	await recordComplianceAuditEvent({
		eventType: 'policy_disabled',
		actorId,
		policyVersion: (active as { version: number }).version,
		reason,
	})

	return { success: true }
}

export async function getActivePolicy(): Promise<PolicyRecord | null> {
	const { data, error } = await getComplianceSchemaClient()
		.from('policies')
		.select('*')
		.eq('status', 'active')
		.maybeSingle()

	if (error) {
		logger.error('[compliance] Failed to load active policy', { error: error.message })
		return null
	}

	return data ? rowToPolicy(data as PolicyRow) : null
}

export async function getPolicyCountryRiskLevel(
	policyId: string,
	countryCode: string,
): Promise<RiskLevel> {
	const { data, error } = await getComplianceSchemaClient()
		.from('policy_country_rules')
		.select('risk_level')
		.eq('policy_id', policyId)
		.eq('country_code', countryCode.toUpperCase())
		.maybeSingle()

	if (error) {
		logger.error('[compliance] Failed to load policy country risk level', { error: error.message })
	}

	return (data as { risk_level: RiskLevel } | null)?.risk_level ?? 'standard'
}

export async function getPolicyActions(policyId: string): Promise<ProtectedAction[]> {
	const { data, error } = await getComplianceSchemaClient()
		.from('policy_actions')
		.select('action')
		.eq('policy_id', policyId)

	if (error) {
		logger.error('[compliance] Failed to load policy actions', { error: error.message })
		return []
	}

	return (data as Array<{ action: ProtectedAction }>).map((row) => row.action)
}

/**
 * Best-effort preview of how many distinct users have a declared or
 * verified country matching one of the policy's non-standard risk rules.
 * Approximate by design (see issue #1009: "a reasonable best-effort query;
 * approximate is fine, documented as such") — it does not attempt to model
 * exceptions or per-action history, only country-level exposure.
 */
export async function previewPolicyImpact(
	policyId: string,
): Promise<{ affectedUserCount: number; countryBreakdown: Record<string, number> }> {
	const client = getComplianceSchemaClient()

	const { data: rules } = await client
		.from('policy_country_rules')
		.select('country_code, risk_level')
		.eq('policy_id', policyId)
		.neq('risk_level', 'standard')

	const nonStandardCodes = ((rules as Array<{ country_code: string }>) ?? []).map(
		(r) => r.country_code,
	)

	if (nonStandardCodes.length === 0) {
		return { affectedUserCount: 0, countryBreakdown: {} }
	}

	const countryBreakdown: Record<string, number> = {}
	let affectedUserCount = 0

	for (const code of nonStandardCodes) {
		const { count } = await client
			.from('country_declarations')
			.select('user_id', { count: 'exact', head: true })
			.or(`declared_country.eq.${code},verified_country.eq.${code}`)

		countryBreakdown[code] = count ?? 0
		affectedUserCount += count ?? 0
	}

	return { affectedUserCount, countryBreakdown }
}

export interface CreateExceptionInput {
	userId: string
	action: ProtectedAction
	policyId?: string | null
	reason: string
	requestedBy: string
	approvedBy?: string | null
	expiresAt: string
}

export async function createException(
	input: CreateExceptionInput,
): Promise<{ success: true; exceptionId: string } | { success: false; error: string }> {
	if (input.approvedBy && input.approvedBy === input.requestedBy) {
		return {
			success: false,
			error: 'Separation of duties: the requester cannot also approve their own exception.',
		}
	}

	const { data, error } = await getComplianceSchemaClient()
		.from('exceptions')
		.insert({
			user_id: input.userId,
			action: input.action,
			policy_id: input.policyId ?? null,
			reason: input.reason,
			requested_by: input.requestedBy,
			approved_by: input.approvedBy ?? null,
			expires_at: input.expiresAt,
		})
		.select('id')
		.single()

	if (error || !data) {
		logger.error('[compliance] Failed to create exception', { error: error?.message })
		return { success: false, error: 'Failed to create exception.' }
	}

	await recordComplianceAuditEvent({
		eventType: 'exception_created',
		actorId: input.requestedBy,
		targetUserId: input.userId,
		action: input.action,
		reason: input.reason,
		exceptionId: (data as { id: string }).id,
	})

	return { success: true, exceptionId: (data as { id: string }).id }
}

export async function revokeException(
	exceptionId: string,
	revokedBy: string,
	reason: string,
): Promise<{ success: true } | { success: false; error: string }> {
	const { data: existing, error: fetchError } = await getComplianceSchemaClient()
		.from('exceptions')
		.select('user_id, action')
		.eq('id', exceptionId)
		.single()

	if (fetchError || !existing) {
		return { success: false, error: 'Exception not found.' }
	}

	const { error } = await getComplianceSchemaClient()
		.from('exceptions')
		.update({ revoked_at: new Date().toISOString(), revoked_by: revokedBy, revoke_reason: reason })
		.eq('id', exceptionId)

	if (error) {
		return { success: false, error: 'Failed to revoke exception.' }
	}

	await recordComplianceAuditEvent({
		eventType: 'exception_revoked',
		actorId: revokedBy,
		targetUserId: (existing as { user_id: string }).user_id,
		action: (existing as { action: string }).action,
		reason,
		exceptionId,
	})

	return { success: true }
}

export async function hasActiveException(
	userId: string,
	action: ProtectedAction,
): Promise<boolean> {
	const now = new Date().toISOString()
	const { data, error } = await getComplianceSchemaClient()
		.from('exceptions')
		.select('id')
		.eq('user_id', userId)
		.eq('action', action)
		.is('revoked_at', null)
		.lte('starts_at', now)
		.gt('expires_at', now)
		.limit(1)

	if (error) {
		logger.error('[compliance] Failed to check active exception', { error: error.message })
		return false
	}

	return Boolean(data && data.length > 0)
}

export async function listPolicies(limit = 50): Promise<PolicyRecord[]> {
	const { data, error } = await getComplianceSchemaClient()
		.from('policies')
		.select('*')
		.order('version', { ascending: false })
		.limit(limit)

	if (error) {
		logger.error('[compliance] Failed to list policies', { error: error.message })
		return []
	}

	return (data as PolicyRow[]).map(rowToPolicy)
}

export interface ExceptionRecord {
	id: string
	userId: string
	action: ProtectedAction
	policyId: string | null
	reason: string
	requestedBy: string
	approvedBy: string | null
	startsAt: string
	expiresAt: string
	revokedAt: string | null
	revokedBy: string | null
	revokeReason: string | null
	createdAt: string
}

export async function listExceptions(limit = 50): Promise<ExceptionRecord[]> {
	const { data, error } = await getComplianceSchemaClient()
		.from('exceptions')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(limit)

	if (error) {
		logger.error('[compliance] Failed to list exceptions', { error: error.message })
		return []
	}

	return (
		data as Array<{
			id: string
			user_id: string
			action: ProtectedAction
			policy_id: string | null
			reason: string
			requested_by: string
			approved_by: string | null
			starts_at: string
			expires_at: string
			revoked_at: string | null
			revoked_by: string | null
			revoke_reason: string | null
			created_at: string
		}>
	).map((row) => ({
		id: row.id,
		userId: row.user_id,
		action: row.action,
		policyId: row.policy_id,
		reason: row.reason,
		requestedBy: row.requested_by,
		approvedBy: row.approved_by,
		startsAt: row.starts_at,
		expiresAt: row.expires_at,
		revokedAt: row.revoked_at,
		revokedBy: row.revoked_by,
		revokeReason: row.revoke_reason,
		createdAt: row.created_at,
	}))
}

export async function listMismatchedCountryProfiles(limit = 100) {
	const { data, error } = await getComplianceSchemaClient()
		.from('country_declarations')
		.select('*')
		.eq('verification_status', 'mismatched')
		.limit(limit)

	if (error) {
		logger.error('[compliance] Failed to list mismatched country profiles', {
			error: error.message,
		})
		return []
	}

	return data ?? []
}
