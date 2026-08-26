export {
	createSmartAccountKitClient,
	SmartAccountKitClientAdapter,
} from './adapters/kit-client.adapter'
export {
	createSmartAccountTransactionBuilder,
	SmartWalletTransactionBuilderAdapter,
} from './adapters/transaction-builder.adapter'
export { requireSmartAccountFeature } from './guards/require-smart-account-feature'
export {
	assertTrustlessWorkCompatibleAddress,
	getTrustlessSignerError,
	TRUSTLESS_WORK_SMART_ACCOUNT_BLOCKER,
} from './integrations/trustless-work.compat'
export {
	type CreateWalletOptions,
	type CreateWalletResult,
	type SmartAccountKitConfig,
	SmartAccountKitService,
} from './kit/smart-account-kit.service'
export { getRpId, getRpName } from './kit/smart-account-kit-config.utils'
export type { SmartAccountKitModule } from './kit/smart-account-kit-loader'
export { loadSmartAccountKit } from './kit/smart-account-kit-loader'
export {
	submitTransaction,
	submitTransactionWithWebAuthn,
} from './transactions/smart-wallet-submission.utils'
export {
	buildTransaction,
	getFundingAccount,
	type SmartWalletTxContext,
	simulateTransaction,
} from './transactions/smart-wallet-transaction-builder.utils'
export {
	SmartWalletTransactionService,
	type TransactionChallenge,
} from './transactions/smart-wallet-transactions'

export { submitSmartAccountTransferWithWebAuthn } from './transactions/submit-with-webauthn.service'
