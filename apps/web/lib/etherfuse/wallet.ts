import { z } from 'zod'
import { STELLAR_G_ADDRESS_REGEX } from '~/lib/utils/escrow/trustless-signer'

export const externalStellarWalletSchema = z
	.string()
	.regex(STELLAR_G_ADDRESS_REGEX, 'A valid external Stellar wallet address (G-address) is required')

export const isExternalStellarWallet = (address: string): boolean =>
	STELLAR_G_ADDRESS_REGEX.test(address)
