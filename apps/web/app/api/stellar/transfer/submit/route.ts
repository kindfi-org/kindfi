import { appEnvConfig } from '@packages/lib/config'
import {
	buildWebAuthnSignatureScVal,
	computeDeviceIdFromCoseKey,
	type verifyAuthentication,
} from '@packages/lib/passkey'
import { StellarPasskeyService } from '@packages/lib/stellar'
import {
	Contract,
	Keypair,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, Server } from '@stellar/stellar-sdk/rpc'
import isEqual from 'lodash/isEqual'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const appConfig = appEnvConfig('web')

const stellarService = new StellarPasskeyService(
	appConfig.stellar.networkPassphrase,
	appConfig.stellar.rpcUrl,
	appConfig.stellar.fundingAccount,
)

/**
 * POST /api/stellar/transfer/submit
 *
 * Submit a signed transaction to the network with WebAuthn signature assembly
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { transactionData, authResponse, userDevice } = body
		const { transactionXDR, hash } = transactionData
		const smartWalletAddress = userDevice?.address
		const verificationJSON = body.verificationJSON as Awaited<
			ReturnType<typeof verifyAuthentication>
		>
		console.log(
			'verificationJSON: WebAuthn Key Verified. user is now authored to sign. getting attestation public key',
			{ verificationJSON },
		)

		// Validate inputs
		if (
			!transactionXDR ||
			!authResponse ||
			!smartWalletAddress ||
			!verificationJSON.device.pubKey
		) {
			return NextResponse.json(
				{
					error:
						'Missing required fields: transactionXDR, authResponse, smartWalletAddress, Public Key',
				},
				{ status: 400 },
			)
		}

		// Get configuration
		const server = new Server(appConfig.stellar.rpcUrl)
		const fundingKeypair = Keypair.fromSecret(appConfig.stellar.fundingAccount)

		console.log('📤 Assembling and submitting transaction')

		// Query and log devices registered in the contract
		const devices = await queryContractDevices(
			server,
			smartWalletAddress,
			fundingKeypair,
			appConfig.stellar.networkPassphrase,
		)

		console.log('📱 Devices registered in contract:', devices.length)
		for (const device of devices) {
			console.log('   Device:', {
				device_id: device.device_id,
				public_key: device.public_key,
			})
		}

		// Parse the prepared transaction
		// CRITICAL: The transaction from prepare is ALREADY assembled after simulation
		// DO NOT re-simulate or re-assemble, as that would change the auth entry structure
		// and invalidate the WebAuthn signature which was signed against the original auth entry
		// ALSO: DO NOT re-sign with funding account - it was already signed in prepare!
		const transaction = TransactionBuilder.fromXDR(
			transactionXDR,
			appConfig.stellar.networkPassphrase,
		) as Transaction

		console.log('✅ Loaded pre-assembled transaction from prepare endpoint')

		const authEntries =
			(transaction.operations[0] as unknown as Api.SimulateHostFunctionResult)
				.auth || []

		console.log('📝 Auth entries count:', authEntries.length)

		if (authEntries.length) {
			const publicKeyArray =
				verificationJSON.device.pubKey instanceof Uint8Array
					? verificationJSON.device.pubKey
					: new Uint8Array(
							Object.values(
								verificationJSON.device.pubKey as Record<string, number>,
							),
						)
			const publicKey = Buffer.from(publicKeyArray).toString('base64')
			const credentialId = verificationJSON.device.id
			const deviceIdHex = computeDeviceIdFromCoseKey(publicKey)
			const signatureResult = buildWebAuthnSignatureScVal({
				assertion: authResponse,
				userData: {
					credential_id: credentialId,
					public_key: publicKey,
					device_id_hex: deviceIdHex,
				},
			})
			const {
				signatureScVal,
				signature,
				authenticatorData,
				clientData,
				webauthnPayload,
				webauthnPayloadHash,
				challenge,
				challengeBytes,
			} = signatureResult

			// Logging WebAuthn Signature Details
			console.log('🔏 WebAuthn Signature Details:')
			console.log('   Signature (base64):', signature.toString('base64'))
			console.log(
				'   Authenticator Data (base64):',
				authenticatorData.toString('base64'),
			)
			console.log('   Client Data (object):', clientData)
			console.log(
				'   WebAuthn Payload (base64):',
				webauthnPayload.toString('base64'),
			)
			console.log(
				'   WebAuthn Payload Hash (hex):',
				webauthnPayloadHash.toString('hex'),
			)
			console.log('   Challenge (utf8):', challenge)
			console.log('   Challenge Bytes (hex):', challengeBytes?.toString('hex'))

			// TODO: If the attestation can be verified here, then it should go through the stellar blockchain
			// ! Strategy still not the same... simplify. A verification already happening, but is not "preparing" the signature to on-chain verification
			const verificationResults = await stellarService.verifyPasskeySignature(
				verificationJSON.device.address,
				JSON.stringify(authResponse.response),
				hash,
			)

			console.log('🔐 Contract will verify signature', { verificationResults })

			// Find and update the auth entry for the smart wallet
			for (const authEntry of authEntries) {
				// ? Since both are Sets, they aren't necessary equal by passing the entire Set, we need to make a copy to compare them properly
				const isSameCredentialMapping = isEqual(
					{ ...authEntry.credentials().switch() },
					{ ...xdr.SorobanCredentialsType.sorobanCredentialsAddress() },
				)
				if (isSameCredentialMapping) {
					const addressCredentials = authEntry.credentials().address()

					// Create new address credentials with our WebAuthn signature
					const newCredentials = new xdr.SorobanAddressCredentials({
						address: addressCredentials.address(),
						nonce: addressCredentials.nonce(),
						signatureExpirationLedger:
							addressCredentials.signatureExpirationLedger(),
						signature: signatureScVal,
					})

					// Update the auth entry with the new credentials containing our signature
					authEntry.credentials(
						xdr.SorobanCredentials.sorobanCredentialsAddress(newCredentials),
					)

					console.log('✅ WebAuthn signature added to auth entry')
					break
				}
			}
		}

		// The transaction is ready - no need to re-sign since we already signed earlier
		// UPDATE: We MUST re-sign because:
		// 1. assembleTransaction() in prepare creates a new transaction (stripping signatures)
		// 2. We modified the auth entry above, which changes the transaction hash
		// 3. The funding account (source) signature is required or we may experience txBadAuth errors
		console.log('📝 Transaction ready for submission')

		// Re-sign with funding account (as it is the source/fee payer)
		console.log('✍️  Signing transaction with funding account...')
		transaction.sign(fundingKeypair)

		console.log('   Hash:', transaction.hash().toString('hex'))

		// Submit to network
		console.log('🚀 Submitting to Stellar network...')
		const submitResult = await server.sendTransaction(transaction)

		if (submitResult.status === 'ERROR') {
			console.error('❌ Submit error:', submitResult)
			throw new Error(
				`Transaction submission failed: ${JSON.stringify(submitResult.errorResult, null, 2) || 'Unknown error'}`,
			)
		}

		const txHash = submitResult.hash
		console.log('Hash:', txHash)
		console.log(`🔗 https://stellar.expert/explorer/testnet/tx/${txHash}`)

		if (submitResult?.errorResult) {
			console.error('❌ Submit error (false positive):', submitResult)
			throw new Error(
				`Transaction submission failed: ${submitResult.errorResult || 'Unknown error'}`,
			)
		}

		console.log('✅ Transaction submitted successfully')
		return NextResponse.json({
			success: true,
			data: {
				hash: txHash, // Changed from txHash to hash to match UI expectation
				status: 'pending',
			},
		})
	} catch (error) {
		console.error('❌ Error submitting transfer:', error)
		return NextResponse.json(
			{
				error: 'Failed to submit transfer',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

/**
 * Query devices registered in smart wallet contract
 */
async function queryContractDevices(
	server: Server,
	contractAddress: string,
	fundingKeypair: Keypair,
	networkPassphrase: string,
): Promise<Array<{ device_id: string; public_key: string }>> {
	try {
		const contract = new Contract(contractAddress)
		const fundingAccount = await server.getAccount(fundingKeypair.publicKey())

		const getDevicesOp = contract.call('get_devices')

		const tx = new TransactionBuilder(fundingAccount, {
			fee: '100',
			networkPassphrase,
		})
			.addOperation(getDevicesOp)
			.setTimeout(30)
			.build()

		const simulation = await server.simulateTransaction(tx)

		if (Api.isSimulationSuccess(simulation) && simulation.result) {
			// Parse the result - it should be a Vec<DevicePublicKey>
			const devicesScVal = simulation.result.retval
			console.log('📱 Contract devices query successful')

			// The result is a Vec, parse it
			if (devicesScVal.switch().name === 'scvVec' && devicesScVal.vec()) {
				const devices = []
				for (const deviceScVal of devicesScVal.vec() || []) {
					// Each device is a struct with device_id and public_key
					if (deviceScVal.switch().name === 'scvMap' && deviceScVal.map()) {
						const deviceMap: Record<string, Buffer> = {}
						for (const entry of deviceScVal.map() || []) {
							const key = entry.key().sym().toString()
							const valBytes = entry.val().bytes()
							if (valBytes) {
								deviceMap[key] = Buffer.from(valBytes)
							}
						}

						if (deviceMap.device_id && deviceMap.public_key) {
							devices.push({
								device_id: deviceMap.device_id.toString('hex'),
								public_key: deviceMap.public_key.toString('hex'),
							})
						}
					}
				}
				return devices
			}
		}

		console.warn('⚠️ Failed to query contract devices')
		return []
	} catch (error) {
		console.error('❌ Error querying contract devices:', error)
		return []
	}
}
