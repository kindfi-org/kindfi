import { logger } from '@/lib/logger'
import {
	KYC_ENFORCEMENT_MODES,
	KYC_FINANCIAL_ACTIONS,
	type KycEnforcementMode,
	type KycFinancialAction,
} from './types'

/**
 * Resolves the server-only `KYC_ENFORCEMENT_MODE` flag.
 *
 * Reads `process.env` directly instead of `appEnvConfig`, which is built
 * around client-visible `NEXT_PUBLIC_*` values. The browser may receive a
 * derived hint for rendering, but this function is the only source of truth
 * for authorization.
 *
 * On Vercel and other Next.js hosts, changing this value requires a
 * **redeploy** (or a process restart for long-running `next start`). It is
 * not hot-reloaded at runtime.
 *
 * Missing or invalid values resolve to `disabled` so misconfiguration never
 * activates enforcement.
 */
export const getKycEnforcementMode = (): KycEnforcementMode => {
	const raw = process.env.KYC_ENFORCEMENT_MODE

	if (!raw) {
		return 'disabled'
	}

	if ((KYC_ENFORCEMENT_MODES as readonly string[]).includes(raw)) {
		return raw as KycEnforcementMode
	}

	logger.warn(
		`[kyc] Invalid KYC_ENFORCEMENT_MODE=${JSON.stringify(raw)}; falling back to "disabled". Valid values: ${KYC_ENFORCEMENT_MODES.join(', ')}.`,
	)
	return 'disabled'
}

/**
 * Parses `KYC_ENFORCED_ACTIONS` (comma-separated). Missing values yield an
 * empty list so enforcement cannot block anything until actions are set.
 * Unknown names are skipped with an operational warning.
 *
 * Changing this value requires a redeploy or process restart.
 */
export const getKycEnforcedActions = (): KycFinancialAction[] => {
	const raw = process.env.KYC_ENFORCED_ACTIONS
	if (!raw || raw.trim() === '') {
		return []
	}

	const valid = new Set<string>(KYC_FINANCIAL_ACTIONS)
	const actions: KycFinancialAction[] = []
	const seen = new Set<KycFinancialAction>()

	for (const part of raw.split(',')) {
		const action = part.trim()
		if (!action) continue
		if (!valid.has(action)) {
			logger.warn(
				`[kyc] Ignoring unknown KYC_ENFORCED_ACTIONS entry ${JSON.stringify(action)}. Valid values: ${KYC_FINANCIAL_ACTIONS.join(', ')}.`,
			)
			continue
		}
		const typed = action as KycFinancialAction
		if (seen.has(typed)) continue
		seen.add(typed)
		actions.push(typed)
	}

	return actions
}

export const isKycActionEnforced = (
	action: KycFinancialAction,
	enforcedActions: KycFinancialAction[] = getKycEnforcedActions(),
): boolean => enforcedActions.includes(action)
