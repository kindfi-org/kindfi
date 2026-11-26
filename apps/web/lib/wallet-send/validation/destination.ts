import { isClassicAccountAddress, isContractAddress } from '@packages/lib/utils/wallet-address'

export type DestinationValidationResult =
	| { ok: true; destination: string; kind: 'g' }
	| { ok: false; error: string }

export const validatePaymentDestination = (
	rawDestination: string,
	sourceAddress: string,
): DestinationValidationResult => {
	const destination = rawDestination.trim()
	if (!destination) {
		return { ok: false, error: 'Enter a destination address.' }
	}

	if (isContractAddress(destination)) {
		return {
			ok: false,
			error: 'The payout address must be a classic Stellar account (G-address).',
		}
	}

	if (isClassicAccountAddress(destination)) {
		if (destination === sourceAddress) {
			return { ok: false, error: 'Destination cannot be the same as your connected wallet.' }
		}

		return { ok: true, destination, kind: 'g' }
	}

	return {
		ok: false,
		error: 'Enter a valid classic Stellar account (G-address).',
	}
}
