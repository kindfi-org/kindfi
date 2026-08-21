/**
 * Shared types for the country-risk compliance domain (issue #1009).
 *
 * This module intentionally contains no policy data. The set of protected
 * actions below is the full configuration surface described by the issue —
 * only `donate` has a real server-side enforcement point wired up in this
 * change (see apps/web/app/api/contributions/create/route.ts). The rest are
 * defined so policies can reference them once those actions grow real
 * server-side entry points.
 */

export const PROTECTED_ACTIONS = [
	'donate',
	'submit_campaign',
	'publish_campaign',
	'create_escrow',
	'release_escrow_funds',
	'send_assets',
	'use_on_ramp',
	'use_off_ramp',
] as const

export type ProtectedAction = (typeof PROTECTED_ACTIONS)[number]

export const RISK_LEVELS = ['standard', 'enhanced_review', 'restricted'] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

export const COUNTRY_VERIFICATION_STATUSES = [
	'declared',
	'verified',
	'mismatched',
	'unavailable',
] as const
export type CountryVerificationStatus = (typeof COUNTRY_VERIFICATION_STATUSES)[number]

export const COUNTRY_RISK_MODES = ['disabled', 'monitor', 'enforced'] as const
export type CountryRiskMode = (typeof COUNTRY_RISK_MODES)[number]

export const POLICY_STATUSES = ['draft', 'active', 'rolled_back', 'disabled'] as const
export type PolicyStatus = (typeof POLICY_STATUSES)[number]

export type RequiredAction = 'complete_kyc' | 'manual_review' | 'contact_support'

export type ReasonCode =
	| 'disabled'
	| 'monitor_mode'
	| 'no_active_policy'
	| 'action_not_covered'
	| 'country_unavailable'
	| 'country_standard_risk'
	| 'country_enhanced_review'
	| 'country_restricted'
	| 'active_exception'
	| 'mismatch_manual_review'

export interface CountryProfile {
	userId: string
	declaredCountry: string | null
	declaredCountryUpdatedAt: string | null
	verifiedCountry: string | null
	verifiedCountryUpdatedAt: string | null
	verificationStatus: CountryVerificationStatus
	ipCountrySignal: string | null
}

export interface AuthorizationDecision {
	allowed: boolean
	enforced: boolean
	mode: CountryRiskMode
	effectiveCountry?: string
	riskLevel?: RiskLevel
	policyVersion?: string
	reasonCode?: ReasonCode
	requiredAction?: RequiredAction
}

export interface AuthorizationInput {
	userId: string
	action: ProtectedAction
	amount?: number
	asset?: string
	stellarNetwork?: string
}
