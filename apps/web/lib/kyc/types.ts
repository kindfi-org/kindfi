/**
 * Shared types for Didit-backed KYC authorization.
 *
 * Didit is KindFi's sole identity-verification provider. These types
 * normalize Didit statuses for internal decisions; they are not a
 * multi-provider abstraction.
 */

export const KYC_ENFORCEMENT_MODES = ['disabled', 'monitor', 'enforced'] as const
export type KycEnforcementMode = (typeof KYC_ENFORCEMENT_MODES)[number]

export const KYC_FINANCIAL_ACTIONS = [
	'donate',
	'submit_campaign',
	'release_escrow_funds',
	'send_assets',
	'use_on_ramp',
	'use_off_ramp',
] as const
export type KycFinancialAction = (typeof KYC_FINANCIAL_ACTIONS)[number]

export const CANONICAL_KYC_STATUSES = [
	'not_started',
	'pending',
	'in_review',
	'approved',
	'rejected',
	'expired',
	'manual_review',
	'provider_unavailable',
] as const
export type CanonicalKycStatus = (typeof CANONICAL_KYC_STATUSES)[number]

export const KYC_POLICY_RESULTS = ['allow', 'deny'] as const
export type KycPolicyResult = (typeof KYC_POLICY_RESULTS)[number]

export const KYC_REQUIRED_ACTIONS = ['start_kyc', 'wait_for_review', 'contact_support'] as const
export type KycRequiredAction = (typeof KYC_REQUIRED_ACTIONS)[number]

export const KYC_REASON_CODES = [
	'disabled',
	'action_not_covered',
	'kyc_approved',
	'kyc_not_started',
	'kyc_pending',
	'kyc_in_review',
	'kyc_manual_review',
	'kyc_rejected',
	'kyc_expired',
	'kyc_provider_unavailable',
] as const
export type KycReasonCode = (typeof KYC_REASON_CODES)[number]

export type KycDbStatus = 'pending' | 'approved' | 'rejected' | 'verified'

export interface AuthorizeFinancialActionInput {
	userId: string
	action: KycFinancialAction
	amount?: number
	asset?: string
	network?: string
}

export interface KycAuthorizationResult {
	allowed: boolean
	enforced: boolean
	mode: KycEnforcementMode
	currentKycStatus: CanonicalKycStatus
	policyResult: KycPolicyResult
	reasonCode?: KycReasonCode
	requiredAction?: KycRequiredAction
}

export interface KycEnforcementUiHint {
	mode: KycEnforcementMode
	blocking: boolean
	enforcedActions: KycFinancialAction[]
}
