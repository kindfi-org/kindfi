/**
 * Client-safe Smart Account exports.
 * Do not import server-only deployment services here — use `@packages/lib/smart-account/server`.
 */
export { smartAccountAddressResolver } from './address-resolver'
export {
	assertSmartAccountEnabled,
	isSmartAccountEnabled,
	SMART_ACCOUNT_DISABLED_REASON,
	SMART_ACCOUNT_FEATURE_FLAG,
} from './feature'
export {
	type ContractOperation,
	type StellarAccount,
	useStellarSorobanAccount,
} from './hooks/use-smart-wallet.hook'
export type {
	PasskeyAccountCreationParams,
	PasskeyAccountInfo,
	PasskeyAccountResult,
	SmartAccountAddressResolver,
	SmartAccountDeployer,
	SmartAccountKitClient,
	SmartAccountTransactionBuilder,
	SmartAccountTransactionSubmitter,
	SubmitTransactionResult,
	TransactionChallenge,
	WebAuthnSubmitParams,
} from './types'
