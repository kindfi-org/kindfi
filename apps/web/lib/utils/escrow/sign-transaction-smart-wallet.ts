/**
 * Signs a Stellar transaction XDR using the user's smart wallet (WebAuthn)
 *
 * @param unsignedXdr - The unsigned transaction XDR from Trustless Work SDK
 * @param userDevice - User device information containing address and credential info
 * @returns The signed transaction XDR ready to be submitted
 */
export async function signTransactionWithSmartWallet(
	unsignedXdr: string,
	userDevice: {
		address: string
		credential_id: string
		public_key: string
	},
): Promise<string> {
	// Step 1: Prepare transaction and get auth options
	const prepareResponse = await fetch('/api/escrow/sign-and-submit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			unsignedTransactionXDR: unsignedXdr,
			userDevice,
		}),
	})

	if (!prepareResponse.ok) {
		const error = await prepareResponse.json()
		throw new Error(error.error || 'Failed to prepare transaction for signing')
	}

	const { authOptions, transactionXDR, nonce } = await prepareResponse.json()

	// Step 2: Perform WebAuthn authentication
	const { startAuthentication } = await import('@simplewebauthn/browser')
	const authResponse = await startAuthentication(authOptions)

	// Step 3: Verify authentication
	const verifyResponse = await fetch('/api/passkey/verify-authentication', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			identifier: userDevice.address,
			authResponse: JSON.stringify(authResponse),
		}),
	})

	if (!verifyResponse.ok) {
		const error = await verifyResponse.json()
		throw new Error(error.error || 'Failed to verify authentication')
	}

	const verificationJSON = await verifyResponse.json()

	// Step 4: Submit signed transaction using the transfer/submit endpoint pattern
	const submitResponse = await fetch('/api/stellar/transfer/submit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			transactionData: {
				transactionXDR,
				hash: nonce,
			},
			authResponse: JSON.stringify(authResponse),
			userDevice,
			verificationJSON,
		}),
	})

	if (!submitResponse.ok) {
		const error = await submitResponse.json()
		throw new Error(error.error || 'Failed to submit transaction')
	}

	const result = await submitResponse.json()

	// Return the transaction hash (the submit endpoint handles the actual signing and submission)
	return result.transactionHash || result.hash
}
