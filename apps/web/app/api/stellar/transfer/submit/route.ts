import { createHash } from 'node:crypto'
import { appEnvConfig, computeDeviceIdFromCoseKey } from '@packages/lib'
import {
	Address,
	Contract,
	Keypair,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, Server } from '@stellar/stellar-sdk/rpc'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { convertP256SignatureAsnToCompact } from '~/lib/passkey/stellar'

/**
 * POST /api/stellar/transfer/submit
 *
 * Submit a signed transaction to the network with WebAuthn signature assembly
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { transactionXDR, authResponse, userDevice } = body
		const smartWalletAddress = userDevice?.address
		const cosePublicKey = userDevice?.public_key

		// Validate inputs
		if (!transactionXDR || !authResponse || !smartWalletAddress) {
			return NextResponse.json(
				{
					error:
						'Missing required fields: transactionXDR, authResponse, smartWalletAddress',
				},
				{ status: 400 },
			)
		}

		if (!cosePublicKey) {
			return NextResponse.json(
				{
					error: 'Missing COSE public key in userDevice',
				},
				{ status: 400 },
			)
		}

		// Compute device_id from COSE public key (not stored in DB for security)
		const deviceIdHex = computeDeviceIdFromCoseKey(cosePublicKey)
		const deviceIdBytes = Buffer.from(deviceIdHex, 'hex')

		// Get configuration
		const config = appEnvConfig('web')
		const server = new Server(config.stellar.rpcUrl)
		const fundingKeypair = Keypair.fromSecret(config.stellar.fundingAccount)

		console.log('📤 Assembling and submitting transaction')
		console.log('   Smart Wallet:', smartWalletAddress)
		console.log('   Credential ID:', authResponse.id)
		console.log('   Device ID (computed):', deviceIdHex)

		// Query and log devices registered in the contract
		const devices = await queryContractDevices(
			server,
			smartWalletAddress,
			fundingKeypair,
			config.stellar.networkPassphrase,
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
			config.stellar.networkPassphrase,
		) as Transaction

		console.log('✅ Loaded pre-assembled transaction from prepare endpoint')
		console.log('   Transaction already signed with funding account in prepare')
		console.log(
			'📋 SUBMIT - Transaction hash:',
			transaction.hash().toString('hex'),
		)

		// biome-ignore lint: accessing auth entries requires type assertion
		const authEntries = (transaction.operations[0] as any)?.auth || []

		console.log('📝 Auth entries count:', authEntries.length)

		if (authEntries.length > 0) {
			// Build the signature ScVal with computed device_id
			const signatureScVal = buildSignatureScVal(authResponse, deviceIdBytes)

			console.log('🔍 Signature ScVal built:', {
				hasAuthenticatorData: true,
				hasClientDataJSON: true,
				hasDeviceId: true,
				deviceIdHex: deviceIdBytes.toString('hex'),
				hasSignature: true,
			})

			// Find and update the auth entry for the smart wallet
			for (const authEntry of authEntries) {
				if (
					authEntry.credentials().switch() ===
					xdr.SorobanCredentialsType.sorobanCredentialsAddress()
				) {
					const addressCredentials = authEntry.credentials().address()
					const authEntryAddressScVal = addressCredentials.address()

					// Convert XDR ScAddress to Stellar address string
					// Use Address.fromScAddress() to convert the XDR address object
					let authEntryAddress = '[conversion failed]'
					try {
						const addressObj = Address.fromScAddress(authEntryAddressScVal)
						authEntryAddress = addressObj.toString()
					} catch (e) {
						console.error('❌ Error converting ScAddress to string:', e)
						console.log('   Raw address object:', authEntryAddressScVal)
					}

					console.log(
						'📋 SUBMIT - Auth entry details (received from prepare):',
						{
							address: authEntryAddress,
							nonce: addressCredentials.nonce().toString(),
							signatureExpirationLedger: addressCredentials
								.signatureExpirationLedger()
								.toString(),
						},
					)

					console.log('🔍 Comparing addresses:')
					console.log('   Smart Wallet (expected):', smartWalletAddress)
					console.log('   Auth Entry Address:', authEntryAddress)
					console.log('   Match:', authEntryAddress === smartWalletAddress)

					// DIAGNOSTIC: Compare with what was expected from prepare
					const expirationValue = addressCredentials
						.signatureExpirationLedger()
						.toString()
					if (expirationValue === '0') {
						console.error('❌ CRITICAL: Expiration is 0 in submit endpoint!')
						console.error(
							'   This means the prepare endpoint did NOT set it correctly',
						)
					} else {
						console.log('✅ Expiration is non-zero:', expirationValue)
					}

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

/**
 * Build Soroban Signature ScVal from WebAuthn response
 * @param authResponse - WebAuthn authentication response
 * @param deviceIdBytes - Pre-computed 32-byte device ID (SHA256 of uncompressed public key)
 */
function buildSignatureScVal(
	authResponse: {
		id: string
		response: {
			authenticatorData: string
			clientDataJSON: string
			signature: string
		}
	},
	deviceIdBytes: Buffer,
): xdr.ScVal {
	// Convert base64url to Buffer
	const authenticatorData = Buffer.from(
		authResponse.response.authenticatorData,
		'base64url',
	)
	const clientDataJSON = Buffer.from(
		authResponse.response.clientDataJSON,
		'base64url',
	)
	const derSignature = Buffer.from(authResponse.response.signature, 'base64url')

	console.log('🔍 Raw WebAuthn signature length:', derSignature.length)
	console.log('🔑 Credential ID:', authResponse.id)
	console.log('🔑 Device ID (from COSE key):', deviceIdBytes.toString('hex'))

	// Decode and log client data JSON for debugging
	const clientDataObj = JSON.parse(clientDataJSON.toString('utf8'))
	console.log('📋 Client Data JSON:', {
		type: clientDataObj.type,
		challenge: clientDataObj.challenge,
		origin: clientDataObj.origin,
	})

	// Log authenticator data details
	console.log(
		'🔐 Authenticator Data length:',
		authenticatorData.length,
		'bytes',
	)
	console.log(
		'🔐 Authenticator Data (hex, first 64 chars):',
		authenticatorData.toString('hex').substring(0, 64) + '...',
	)

	// Convert DER-encoded signature (70 bytes) to raw R+S format (64 bytes)
	// WebAuthn signatures are DER-encoded ASN.1, but Soroban expects raw R+S
	const signature = convertP256SignatureAsnToCompact(derSignature)

	console.log('✅ Converted signature length:', signature.length)
	console.log(
		'✅ Signature (hex, first 32 chars):',
		signature.toString('hex').substring(0, 32) + '...',
	)

	// Ensure signature is exactly 64 bytes (secp256r1)
	if (signature.length !== 64) {
		throw new Error(
			`Invalid signature length: ${signature.length} (expected 64 bytes)`,
		)
	}

	// Ensure device ID is exactly 32 bytes
	if (deviceIdBytes.length !== 32) {
		throw new Error(
			`Invalid device ID length: ${deviceIdBytes.length} (expected 32 bytes)`,
		)
	}

	// Log what the contract will verify
	// The contract computes: SHA256(authenticator_data || SHA256(client_data_json))
	const clientDataHash = createHash('sha256').update(clientDataJSON).digest()
	const webauthnPayload = Buffer.concat([authenticatorData, clientDataHash])
	const webauthnPayloadHash = createHash('sha256')
		.update(webauthnPayload)
		.digest()

	console.log('🔐 Contract will verify signature against:')
	console.log('   SHA256(client_data_json):', clientDataHash.toString('hex'))
	console.log(
		'   authenticator_data || SHA256(client_data_json) length:',
		webauthnPayload.length,
		'bytes',
	)
	console.log(
		'   SHA256(authenticator_data || SHA256(client_data_json)):',
		webauthnPayloadHash.toString('hex'),
	)

	// CRITICAL: Log what Soroban expects as the challenge
	// The contract validates: client_data.challenge == base64url(signature_payload)
	console.log('🔍 Challenge validation:')
	console.log('   Challenge in client_data_json:', clientDataObj.challenge)
	console.log('   Challenge length:', clientDataObj.challenge.length, 'chars')
	const challengeBytes = Buffer.from(clientDataObj.challenge, 'base64url')
	console.log('   Challenge (decoded hex):', challengeBytes.toString('hex'))
	console.log('   Challenge (decoded length):', challengeBytes.length, 'bytes')

	// Build the Signature struct matching the contract definition:
	// pub struct Signature {
	//     pub authenticator_data: Bytes,
	//     pub client_data_json: Bytes,
	//     pub device_id: BytesN<32>,
	//     pub signature: BytesN<64>,
	// }
	const signatureStruct = xdr.ScVal.scvMap([
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('authenticator_data'),
			val: xdr.ScVal.scvBytes(authenticatorData),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('client_data_json'),
			val: xdr.ScVal.scvBytes(clientDataJSON),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('device_id'),
			val: xdr.ScVal.scvBytes(deviceIdBytes),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('signature'),
			val: xdr.ScVal.scvBytes(signature),
		}),
	])

	return signatureStruct
}
