import type { KycAuthorizationAuditEvent } from './audit-log'
import { getKycEnforcedActions, getKycEnforcementMode } from './enforcement-config'
import { isApprovedKycStatus, reasonCodeForStatus, requiredActionForStatus } from './status'
import type {
	AuthorizeFinancialActionInput,
	CanonicalKycStatus,
	KycAuthorizationResult,
	KycEnforcementMode,
	KycFinancialAction,
	KycPolicyResult,
	KycReasonCode,
	KycRequiredAction,
} from './types'

interface HypotheticalPolicy {
	policyResult: KycPolicyResult
	reasonCode: KycReasonCode
	requiredAction?: KycRequiredAction
	currentKycStatus: CanonicalKycStatus
}

export interface AuthorizeFinancialActionDeps {
	getMode?: () => KycEnforcementMode
	getEnforcedActions?: () => KycFinancialAction[]
	getStatus?: (userId: string) => Promise<CanonicalKycStatus>
	recordAudit?: (event: KycAuthorizationAuditEvent) => Promise<void>
}

const evaluateEnforcedPolicy = (
	input: AuthorizeFinancialActionInput,
	currentKycStatus: CanonicalKycStatus,
	enforcedActions: KycFinancialAction[],
): HypotheticalPolicy => {
	if (!enforcedActions.includes(input.action)) {
		return {
			policyResult: 'allow',
			reasonCode: 'action_not_covered',
			currentKycStatus,
		}
	}

	if (isApprovedKycStatus(currentKycStatus)) {
		return {
			policyResult: 'allow',
			reasonCode: 'kyc_approved',
			currentKycStatus,
		}
	}

	return {
		policyResult: 'deny',
		reasonCode: reasonCodeForStatus(currentKycStatus),
		requiredAction: requiredActionForStatus(currentKycStatus),
		currentKycStatus,
	}
}

/**
 * Centralized server-side authorization for Didit-gated financial actions.
 * Never trust a KYC status or decision received from the browser.
 *
 * Modes:
 *  - disabled (default): always `allowed: true`. Does not read KYC status or
 *    write audit events, so user experience matches the pre-gating product.
 *  - monitor: evaluates the enforced policy and records the hypothetical
 *    result, but always returns `allowed: true`.
 *  - enforced: denies configured actions unless Didit status is approved.
 */
export const authorizeFinancialAction = async (
	input: AuthorizeFinancialActionInput,
	deps: AuthorizeFinancialActionDeps = {},
): Promise<KycAuthorizationResult> => {
	const mode = (deps.getMode ?? getKycEnforcementMode)()

	if (mode === 'disabled') {
		return {
			allowed: true,
			enforced: false,
			mode,
			currentKycStatus: 'not_started',
			policyResult: 'allow',
			reasonCode: 'disabled',
		}
	}

	const getStatus =
		deps.getStatus ?? (await import('./session-service')).getCanonicalKycStatusForUser
	const currentKycStatus = await getStatus(input.userId)
	const enforcedActions = (deps.getEnforcedActions ?? getKycEnforcedActions)()
	const hypothetical = evaluateEnforcedPolicy(input, currentKycStatus, enforcedActions)
	const enforced = mode === 'enforced'
	const allowed = enforced ? hypothetical.policyResult === 'allow' : true

	const recordAudit = deps.recordAudit ?? (await import('./audit-log')).recordKycAuthorizationEvent
	await recordAudit({
		userId: input.userId,
		action: input.action,
		currentKycStatus,
		mode,
		decisionAllowed: allowed,
		hypotheticalAllowed: hypothetical.policyResult === 'allow',
		policyResult: hypothetical.policyResult,
		reasonCode: hypothetical.reasonCode,
		amount: input.amount,
		asset: input.asset,
		network: input.network,
	})

	return {
		allowed,
		enforced,
		mode,
		currentKycStatus,
		policyResult: hypothetical.policyResult,
		reasonCode: hypothetical.reasonCode,
		requiredAction: allowed ? undefined : hypothetical.requiredAction,
	}
}
