import { logger } from '@/lib/logger'
import { getComplianceSchemaClient } from './supabase-compliance-client'
import type { CountryRiskMode, CountryVerificationStatus, ReasonCode } from './types'

export type ComplianceAuditEventType =
	| 'policy_created'
	| 'policy_updated'
	| 'policy_activated'
	| 'policy_rolled_back'
	| 'policy_disabled'
	| 'exception_created'
	| 'exception_revoked'
	| 'authorization_decision'
	| 'mismatch_detected'
	| 'declared_country_set'

export interface ComplianceAuditEvent {
	eventType: ComplianceAuditEventType
	actorId?: string | null
	targetUserId?: string | null
	action?: string | null
	declaredCountry?: string | null
	verifiedCountry?: string | null
	effectiveCountry?: string | null
	verificationStatus?: CountryVerificationStatus | null
	enforcementMode?: CountryRiskMode | null
	policyVersion?: number | null
	decisionAllowed?: boolean | null
	hypotheticalAllowed?: boolean | null
	reasonCode?: ReasonCode | string | null
	exceptionId?: string | null
	reason?: string | null
	metadata?: Record<string, unknown>
}

/**
 * Immutable, append-only audit trail for the country-risk compliance domain.
 * Never write identity documents, biometrics, or full KYC provider payloads
 * here — only country codes, status enums, and short reason text.
 *
 * Never throws: an audit-log failure must not block the underlying policy
 * change or authorization decision it describes.
 */
export async function recordComplianceAuditEvent(event: ComplianceAuditEvent): Promise<void> {
	try {
		const { error } = await getComplianceSchemaClient()
			.from('audit_log')
			.insert({
				event_type: event.eventType,
				actor_id: event.actorId ?? null,
				target_user_id: event.targetUserId ?? null,
				action: event.action ?? null,
				declared_country: event.declaredCountry ?? null,
				verified_country: event.verifiedCountry ?? null,
				effective_country: event.effectiveCountry ?? null,
				verification_status: event.verificationStatus ?? null,
				enforcement_mode: event.enforcementMode ?? null,
				policy_version: event.policyVersion ?? null,
				decision_allowed: event.decisionAllowed ?? null,
				hypothetical_allowed: event.hypotheticalAllowed ?? null,
				reason_code: event.reasonCode ?? null,
				exception_id: event.exceptionId ?? null,
				reason: event.reason ?? null,
				metadata: event.metadata ?? {},
			})

		if (error) throw error
	} catch (err) {
		logger.error('[compliance] Failed to record audit event', {
			eventType: event.eventType,
			error: err instanceof Error ? err.message : String(err),
		})
	}
}
