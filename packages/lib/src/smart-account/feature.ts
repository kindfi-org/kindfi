import { appEnvConfig } from '../config'

const SMART_ACCOUNT_DISABLED_MESSAGE =
	'Smart Account features are disabled. Set NEXT_PUBLIC_ENABLE_SMART_ACCOUNT_CREATION=true to enable (testnet only).'

/**
 * Returns whether Smart Account (C-address) creation and operations are enabled.
 * Must remain false on Mainnet production until Trustless Work supports C-address signing.
 */
export const isSmartAccountEnabled = (): boolean =>
	appEnvConfig('web').features.enableSmartAccountCreation

/**
 * Throws when Smart Account features are disabled.
 */
export const assertSmartAccountEnabled = (): void => {
	if (!isSmartAccountEnabled()) {
		throw new Error(SMART_ACCOUNT_DISABLED_MESSAGE)
	}
}

export const SMART_ACCOUNT_FEATURE_FLAG = 'NEXT_PUBLIC_ENABLE_SMART_ACCOUNT_CREATION' as const

export const SMART_ACCOUNT_DISABLED_REASON = SMART_ACCOUNT_DISABLED_MESSAGE
