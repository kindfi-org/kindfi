import { isClassicAccountAddress } from '@packages/lib/utils/wallet-address'
import type {
	InitializeMultiReleaseEscrowPayload,
	InitializeSingleReleaseEscrowPayload,
} from '@trustless-work/escrow'

type EscrowPayload = InitializeSingleReleaseEscrowPayload | InitializeMultiReleaseEscrowPayload

export const assertClassicEscrowPayloadAddresses = (payload: EscrowPayload): void => {
	if (!isClassicAccountAddress(payload.signer)) {
		throw new Error('Escrow signer must be a classic Stellar account (G-address).')
	}
	for (const [role, address] of Object.entries(payload.roles)) {
		if (!isClassicAccountAddress(address)) {
			throw new Error(
				role === 'receiver'
					? 'The payout address must be a classic Stellar account (G-address).'
					: `${role} must be a classic Stellar account (G-address).`,
			)
		}
	}
	for (const milestone of payload.milestones) {
		if ('receiver' in milestone && !isClassicAccountAddress(milestone.receiver)) {
			throw new Error('The payout address must be a classic Stellar account (G-address).')
		}
	}
}
