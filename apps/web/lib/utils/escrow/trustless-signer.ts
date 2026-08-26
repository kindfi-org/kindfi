/**
 * @deprecated Import from `@/lib/smart-account/integrations/trustless-work.compat` instead.
 * @smart-account-integration-point
 */

export { isExternalStellarWalletAddress } from '@packages/lib/utils/wallet-address'
export {
	assertTrustlessWorkCompatibleAddress,
	getTrustlessSignerError,
	isSmartAccountAddress,
	STELLAR_C_ADDRESS_REGEX,
	STELLAR_G_ADDRESS_REGEX,
	TRUSTLESS_WORK_SMART_ACCOUNT_BLOCKER,
} from '@/lib/smart-account/integrations/trustless-work.compat'
