import { logger } from '@/lib/logger'
import { getKycSchemaClient } from './supabase-kyc-client'
import type {
	CanonicalKycStatus,
	KycEnforcementMode,
	KycFinancialAction,
	KycPolicyResult,
	KycReasonCode,
} from './types'

export interface KycAuthorizationAuditEvent {
	userId: string
	action: KycFinancialAction
	currentKycStatus: CanonicalKycStatus
	mode: KycEnforcementMode
	decisionAllowed: boolean
	hypotheticalAllowed: boolean
	policyResult: KycPolicyResult
	reasonCode?: KycReasonCode
	amount?: number
	asset?: string
	network?: string
}

/**
 * Privacy-conscious audit trail for KYC authorization decisions.
 * Never write identity documents, biometrics, or Didit decision payloads.
 *
 * Never throws: audit failure must not block the underlying decision.
 */
export const recordKycAuthorizationEvent = async (
	event: KycAuthorizationAuditEvent,
): Promise<void> => {
	try {
		const { error } = await getKycSchemaClient()
			.from('authorization_events')
			.insert({
				user_id: event.userId,
				action: event.action,
				current_kyc_status: event.currentKycStatus,
				enforcement_mode: event.mode,
				decision_allowed: event.decisionAllowed,
				hypothetical_allowed: event.hypotheticalAllowed,
				policy_result: event.policyResult,
				reason_code: event.reasonCode ?? null,
				amount: event.amount ?? null,
				asset: event.asset ?? null,
				network: event.network ?? null,
			})

		if (error) throw error
	} catch (err) {
		logger.error('[kyc] Failed to record authorization event', {
			action: event.action,
			error: err instanceof Error ? err.message : String(err),
		})
	}
}
