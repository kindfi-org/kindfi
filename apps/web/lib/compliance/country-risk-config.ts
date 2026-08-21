import { logger } from '@/lib/logger'
import { COUNTRY_RISK_MODES, type CountryRiskMode } from './types'

/**
 * Resolves the server-only `COUNTRY_RISK_MODE` feature flag.
 *
 * Deliberately reads `process.env` directly instead of going through
 * `packages/lib/src/config/app-env.config.ts`, which is built around
 * `NEXT_PUBLIC_*` client-visible config. Country-risk mode must never be
 * authoritative on the client — only a derived boolean
 * (`isCountryRiskUiHintEnabled`) is safe to expose for UX/rendering, and even
 * that must never be trusted as an authorization boundary.
 *
 * `COUNTRY_RISK_MODE` is a server-only env var in a Next.js app: changing it
 * requires a redeploy (or process restart in long-running server contexts).
 * It is not read from the client bundle and has no `NEXT_PUBLIC_` mirror.
 *
 * Missing or invalid values resolve to `disabled` and log an operational
 * warning so misconfiguration is visible without ever failing open into
 * enforcement.
 */
export function getCountryRiskMode(): CountryRiskMode {
	const raw = process.env.COUNTRY_RISK_MODE

	if (!raw) {
		return 'disabled'
	}

	if ((COUNTRY_RISK_MODES as readonly string[]).includes(raw)) {
		return raw as CountryRiskMode
	}

	logger.warn(
		`[compliance] Invalid COUNTRY_RISK_MODE=${JSON.stringify(raw)}; falling back to "disabled". Valid values: ${COUNTRY_RISK_MODES.join(', ')}.`,
	)
	return 'disabled'
}

export function isEnforcementActive(mode: CountryRiskMode = getCountryRiskMode()): boolean {
	return mode === 'enforced'
}

export function isMonitoringActive(mode: CountryRiskMode = getCountryRiskMode()): boolean {
	return mode === 'monitor' || mode === 'enforced'
}
