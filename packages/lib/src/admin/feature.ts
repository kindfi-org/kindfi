import { appEnvConfig } from '../config'

const ADMIN_OPS_DASHBOARD_DISABLED_MESSAGE =
	'The admin operations dashboard is disabled. Set NEXT_PUBLIC_ADMIN_OPS_DASHBOARD=true to enable.'

/**
 * Returns whether the redesigned admin operations dashboard is enabled.
 * Always enabled in development; opt-in elsewhere via the env flag.
 */
export const isAdminOpsDashboardEnabled = (): boolean =>
	appEnvConfig('web').features.enableAdminOpsDashboard

/**
 * Throws when the admin operations dashboard is disabled.
 */
export const assertAdminOpsDashboardEnabled = (): void => {
	if (!isAdminOpsDashboardEnabled()) {
		throw new Error(ADMIN_OPS_DASHBOARD_DISABLED_MESSAGE)
	}
}

export const ADMIN_OPS_DASHBOARD_FEATURE_FLAG = 'NEXT_PUBLIC_ADMIN_OPS_DASHBOARD' as const
