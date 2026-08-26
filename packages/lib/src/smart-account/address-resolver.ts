import { isSmartAccountContractAddress, isSmartAccountPlaceholder } from '../utils/wallet-address'
import type { SmartAccountAddressResolver } from './types'

export const smartAccountAddressResolver: SmartAccountAddressResolver = {
	resolve(address: string | null | undefined): string | null {
		if (!address || isSmartAccountPlaceholder(address)) {
			return null
		}
		return isSmartAccountContractAddress(address) ? address : null
	},
}
