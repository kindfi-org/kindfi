import { recordComplianceAuditEvent } from './audit-log'
import { getCountryProfile } from './country-declaration-service'
import { getCountryRiskMode } from './country-risk-config'
import {
	getActivePolicy,
	getPolicyActions,
	getPolicyCountryRiskLevel,
	hasActiveException,
} from './policy-service'
import type { AuthorizationDecision, AuthorizationInput, ReasonCode, RiskLevel } from './types'

/**
 * Whether to fall back to the self-declared country when no Didit-verified
 * country is on file. Must be explicitly opted into via env var — the safe
 * default is `false` (unavailable country escalates to manual review rather
 * than trusting an unverified self-report for an enforced decision).
 */
function isDeclaredCountryFallbackEnabled(): boolean {
	return process.env.COUNTRY_RISK_ALLOW_DECLARED_FALLBACK === 'true'
}

interface HypotheticalResult {
	allowed: boolean
	effectiveCountry?: string
	riskLevel?: RiskLevel
	reasonCode: ReasonCode
	requiredAction?: 'complete_kyc' | 'manual_review' | 'contact_support'
}

async function computeHypotheticalDecision(input: AuthorizationInput): Promise<HypotheticalResult> {
	const policy = await getActivePolicy()

	if (!policy) {
		return { allowed: true, reasonCode: 'no_active_policy' }
	}

	const policyActions = await getPolicyActions(policy.id)
	if (!policyActions.includes(input.action)) {
		return { allowed: true, reasonCode: 'action_not_covered' }
	}

	if (await hasActiveException(input.userId, input.action)) {
		return { allowed: true, reasonCode: 'active_exception' }
	}

	const countryProfile = await getCountryProfile(input.userId)
	const declaredFallback = isDeclaredCountryFallbackEnabled()
		? (countryProfile?.declaredCountry ?? undefined)
		: undefined
	const effectiveCountry = countryProfile?.verifiedCountry ?? declaredFallback

	if (!effectiveCountry) {
		return {
			allowed: false,
			reasonCode: 'country_unavailable',
			requiredAction: 'complete_kyc',
		}
	}

	const riskLevel = await getPolicyCountryRiskLevel(policy.id, effectiveCountry)
	const mismatchRequiresReview = countryProfile?.verificationStatus === 'mismatched'

	if (riskLevel === 'restricted') {
		return {
			allowed: false,
			effectiveCountry,
			riskLevel,
			reasonCode: 'country_restricted',
			requiredAction: 'contact_support',
		}
	}

	if (riskLevel === 'enhanced_review' || mismatchRequiresReview) {
		return {
			allowed: true,
			effectiveCountry,
			riskLevel,
			reasonCode: mismatchRequiresReview ? 'mismatch_manual_review' : 'country_enhanced_review',
			requiredAction: 'manual_review',
		}
	}

	return {
		allowed: true,
		effectiveCountry,
		riskLevel,
		reasonCode: 'country_standard_risk',
	}
}

/**
 * Centralized server-side authorization check for country-risk-restricted
 * financial actions. This is the ONLY function that should be treated as an
 * authorization boundary for these actions — client-side checks built on top
 * of its result are UX only.
 *
 * Modes:
 *  - disabled (default): short-circuits with `allowed: true` and does not
 *    touch the database at all, so behavior is identical to before this
 *    feature existed.
 *  - monitor: computes and audits the hypothetical decision but always
 *    returns `allowed: true`.
 *  - enforced: returns the hypothetical decision as the real decision.
 */
export async function evaluateCountryRiskAuthorization(
	input: AuthorizationInput,
): Promise<AuthorizationDecision> {
	const mode = getCountryRiskMode()

	if (mode === 'disabled') {
		return { allowed: true, enforced: false, mode }
	}

	const hypothetical = await computeHypotheticalDecision(input)
	const enforced = mode === 'enforced'
	const allowed = enforced ? hypothetical.allowed : true

	const policy = await getActivePolicy()

	await recordComplianceAuditEvent({
		eventType: 'authorization_decision',
		targetUserId: input.userId,
		action: input.action,
		effectiveCountry: hypothetical.effectiveCountry ?? null,
		enforcementMode: mode,
		policyVersion: policy?.version ?? null,
		decisionAllowed: allowed,
		hypotheticalAllowed: hypothetical.allowed,
		reasonCode: hypothetical.reasonCode,
		metadata: { amount: input.amount, asset: input.asset, stellarNetwork: input.stellarNetwork },
	})

	return {
		allowed,
		enforced,
		mode,
		effectiveCountry: hypothetical.effectiveCountry,
		riskLevel: hypothetical.riskLevel,
		policyVersion: policy ? String(policy.version) : undefined,
		reasonCode: hypothetical.reasonCode,
		requiredAction: hypothetical.requiredAction,
	}
}
