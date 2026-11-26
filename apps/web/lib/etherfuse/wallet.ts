import { isClassicAccountAddress } from '@packages/lib/utils/wallet-address'
import { z } from 'zod'

export const externalStellarWalletSchema = z
	.string()
	.refine(isClassicAccountAddress, 'A valid classic Stellar account (G-address) is required')

export const isExternalStellarWallet = (address: string): boolean =>
	isClassicAccountAddress(address)
