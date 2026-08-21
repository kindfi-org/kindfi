import { StrKey } from '@stellar/stellar-sdk'
import { STELLAR_C_ADDRESS_REGEX } from '~/lib/utils/wallet-address'

export type DestinationValidationResult =
	| { ok: true; destination: string; kind: 'g' | 'm' }
	| { ok: false; error: string }

export const validatePaymentDestination = (
	rawDestination: string,
	sourceAddress: string,
): DestinationValidationResult => {
	const destination = rawDestination.trim()
	if (!destination) {
		return { ok: false, error: 'Enter a destination address.' }
	}

	if (STELLAR_C_ADDRESS_REGEX.test(destination)) {
		return {
			ok: false,
			error:
				'Smart contract addresses are not supported for wallet sends. Use a Stellar G or M address.',
		}
	}

	if (StrKey.isValidMed25519PublicKey(destination)) {
		if (destination === sourceAddress) {
			return { ok: false, error: 'Destination cannot be the same as your connected wallet.' }
		}

		return { ok: true, destination, kind: 'm' }
	}

	if (StrKey.isValidEd25519PublicKey(destination)) {
		if (destination === sourceAddress) {
			return { ok: false, error: 'Destination cannot be the same as your connected wallet.' }
		}

		return { ok: true, destination, kind: 'g' }
	}

	return {
		ok: false,
		error: 'Enter a valid Stellar G-address or muxed M-address.',
	}
}
