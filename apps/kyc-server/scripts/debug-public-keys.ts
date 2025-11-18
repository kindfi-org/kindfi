/**
 * Debug Script: Compare Public Keys
 *
 * Compares public keys between:
 * 1. Database (devices table)
 * 2. Smart wallet contract (on-chain)
 * 3. Expected format (uncompressed secp256r1)
 *
 * Usage:
 * ```bash
 * bun run apps/kyc-server/scripts/debug-public-keys.ts <credential_id>
 * ```
 */

import { devices } from '@packages/drizzle'
import {
	base64ToHexUncompressedKey,
	detectPublicKeyFormat,
} from '@packages/lib'
import { appEnvConfig } from '@packages/lib/config'
import { Contract, Keypair } from '@stellar/stellar-sdk'
import { Api, Server } from '@stellar/stellar-sdk/rpc'
import { eq } from 'drizzle-orm'
import { getDb } from '../src/lib/services/db'

const credentialId = process.argv[2]

if (!credentialId) {
	console.error('❌ Usage: bun run debug-public-keys.ts <credential_id>')
	console.error('Example: bun run debug-public-keys.ts lqujaWhzUHOWTXciKLpDaQ')
	process.exit(1)
}

async function debugPublicKeys() {
	console.log('🔍 Debugging public keys for credential:', credentialId)
	console.log('='.repeat(80))

	const db = getDb
	const config = appEnvConfig('kyc-server')

	// 1. Get device from database
	console.log('\n📦 1. DATABASE CHECK')
	console.log('-'.repeat(80))

	const deviceRecords = await db
		.select()
		.from(devices)
		.where(eq(devices.credentialId, credentialId))

	if (deviceRecords.length === 0) {
		console.error('❌ Device not found in database')
		process.exit(1)
	}

	const device = deviceRecords[0]
	const dbPublicKey = device.publicKey

	console.log('✅ Device found in database')
	console.log('   ID:', device.id)
	console.log('   Address:', device.address)
	console.log('   Credential ID:', device.credentialId)
	console.log('   Public Key (base64):', dbPublicKey.substring(0, 32) + '...')
	console.log('   Public Key length:', dbPublicKey.length, 'chars')

	// Detect format
	const dbFormat = detectPublicKeyFormat(dbPublicKey)
	console.log('   Detected format:', dbFormat)

	// Convert to hex
	try {
		const dbPublicKeyHex = base64ToHexUncompressedKey(dbPublicKey)
		console.log('   Public Key (hex):', dbPublicKeyHex.substring(0, 32) + '...')
		console.log('   Hex length:', dbPublicKeyHex.length, 'chars (should be 130)')

		if (dbPublicKeyHex.length !== 130) {
			console.warn(
				'⚠️  Unexpected hex length:',
				dbPublicKeyHex.length,
				'(expected 130 for 65 bytes)',
			)
		}

		if (!dbPublicKeyHex.startsWith('04')) {
			console.warn(
				'⚠️  Key does not start with 04 (uncompressed indicator):',
				dbPublicKeyHex.substring(0, 4),
			)
		}
	} catch (error) {
		console.error('❌ Error converting to hex:', error)
	}

	// 2. Get device from contract
	console.log('\n🔗 2. SMART CONTRACT CHECK')
	console.log('-'.repeat(80))

	const smartWalletAddress = device.address

	if (!smartWalletAddress || smartWalletAddress === '0x') {
		console.error('❌ No smart wallet address in database')
		process.exit(1)
	}

	console.log('   Smart Wallet:', smartWalletAddress)

	try {
		const server = new Server(config.stellar.rpcUrl)
		const fundingKeypair = Keypair.fromSecret(config.stellar.fundingAccount)

		// Query contract for devices
		const contract = new Contract(smartWalletAddress)
		const fundingAccount = await server.getAccount(fundingKeypair.publicKey())

		const { TransactionBuilder, nativeToScVal } = await import(
			'@stellar/stellar-sdk'
		)
		const getDevicesOp = contract.call('get_devices')

		const tx = new TransactionBuilder(fundingAccount, {
			fee: '100',
			networkPassphrase: config.stellar.networkPassphrase,
		})
			.addOperation(getDevicesOp)
			.setTimeout(30)
			.build()

		const simulation = await server.simulateTransaction(tx)

		if (Api.isSimulationSuccess(simulation) && simulation.result) {
			console.log('✅ Contract query successful')

			const devicesScVal = simulation.result.retval

			if (devicesScVal.switch().name === 'scvVec' && devicesScVal.vec()) {
				const devicesList = devicesScVal.vec() || []
				console.log('   Devices registered:', devicesList.length)

				for (const deviceScVal of devicesList) {
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
							const contractDeviceId = deviceMap.device_id.toString('hex')
							const contractPublicKey = deviceMap.public_key.toString('hex')

							console.log('\n   📱 Device from contract:')
							console.log('      Device ID:', contractDeviceId)
							console.log(
								'      Public Key:',
								contractPublicKey.substring(0, 32) + '...',
							)
							console.log('      Public Key length:', contractPublicKey.length)

							// Check if this matches our credential
							const credentialHash = require('node:crypto')
								.createHash('sha256')
								.update(Buffer.from(credentialId, 'base64'))
								.digest('hex')

							console.log('\n   🔍 Comparison:')
							console.log('      Credential ID:', credentialId)
							console.log('      Expected Device ID (hash):', credentialHash)
							console.log('      Contract Device ID:', contractDeviceId)
							console.log('      Match:', credentialHash === contractDeviceId)

							if (credentialHash === contractDeviceId) {
								// This is our device - compare keys
								const dbPublicKeyHex = base64ToHexUncompressedKey(dbPublicKey)

								console.log('\n   🔑 Public Key Comparison:')
								console.log('      Database key:', dbPublicKeyHex)
								console.log('      Contract key:', contractPublicKey)
								console.log('      Match:', dbPublicKeyHex === contractPublicKey)

								if (dbPublicKeyHex !== contractPublicKey) {
									console.error('\n❌ PUBLIC KEY MISMATCH!')
									console.error('This is why signature validation fails!')
									console.error('\nDifferences:')
									console.error('   DB length:', dbPublicKeyHex.length)
									console.error('   Contract length:', contractPublicKey.length)

									// Find first difference
									for (let i = 0; i < Math.max(dbPublicKeyHex.length, contractPublicKey.length); i++) {
										if (dbPublicKeyHex[i] !== contractPublicKey[i]) {
											console.error(
												`   First diff at position ${i}:`,
												dbPublicKeyHex[i],
												'vs',
												contractPublicKey[i],
											)
											break
										}
									}
								} else {
									console.log('\n✅ PUBLIC KEYS MATCH!')
									console.log('The issue is likely in signature format or challenge')
								}
							}
						}
					}
				}
			}
		} else {
			console.error('❌ Contract simulation failed')
			if ('error' in simulation) {
				console.error('   Error:', simulation.error)
			}
		}
	} catch (error) {
		console.error('❌ Error querying contract:', error)
	}

	console.log('\n' + '='.repeat(80))
	console.log('✨ Debug complete')
}

debugPublicKeys()
	.then(() => {
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Fatal error:', error)
		process.exit(1)
	})
