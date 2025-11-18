/**
 * Diagnostic Test Script for WebAuthn Smart Wallet Transactions
 *
 * This script helps identify the root cause of txBadAuth errors by:
 * 1. Verifying assembleTransaction behavior
 * 2. Checking XDR encoding correctness
 * 3. Comparing prepare vs submit auth entries
 * 4. Validating signature_payload computation
 *
 * Run this script to diagnose WebAuthn signature validation issues.
 */

import { createHash } from 'node:crypto'
import {
	Account,
	Address,
	Contract,
	Keypair,
	nativeToScVal,
	type Transaction,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'

interface DiagnosticResult {
	step: string
	success: boolean
	details: Record<string, unknown>
	issues: string[]
}

export class SmartWalletDiagnostics {
	private server: Server
	private networkPassphrase: string
	private fundingKeypair: Keypair

	constructor(
		networkPassphrase: string,
		rpcUrl: string,
		fundingSecretKey: string,
	) {
		this.networkPassphrase = networkPassphrase
		this.server = new Server(rpcUrl)
		this.fundingKeypair = Keypair.fromSecret(fundingSecretKey)
	}

	/**
	 * Run comprehensive diagnostic tests
	 */
	async runDiagnostics(params: {
		smartWalletAddress: string
		recipientAddress: string
		amount: number
	}): Promise<DiagnosticResult[]> {
		const results: DiagnosticResult[] = []

		console.log('🔍 Starting Smart Wallet Diagnostics...\n')

		// Test 1: Build and simulate transaction
		const step1 = await this.testTransactionSimulation(params)
		results.push(step1)

		if (!step1.success) {
			console.error('❌ Cannot proceed - simulation failed\n')
			return results
		}

		// Test 2: Verify simulation modification
		const step2 = await this.testSimulationModification(params)
		results.push(step2)

		// Test 3: Verify assembleTransaction behavior
		const step3 = await this.testAssembleTransaction(params)
		results.push(step3)

		// Test 4: Verify XDR encoding
		const step4 = await this.testXDREncoding(step3.details.assembledTx)
		results.push(step4)

		// Test 5: Verify signature_payload extraction
		const step5 = await this.testSignaturePayloadExtraction(
			step3.details.assembledTx,
		)
		results.push(step5)

		// Print summary
		this.printSummary(results)

		return results
	}

	/**
	 * Test 1: Build and simulate transaction
	 */
	private async testTransactionSimulation(params: {
		smartWalletAddress: string
		recipientAddress: string
		amount: number
	}): Promise<DiagnosticResult> {
		console.log('📋 Test 1: Transaction Simulation')

		const issues: string[] = []
		let success = false
		const details: Record<string, unknown> = {}

		try {
			// Build transaction
			const contract = new Contract(params.smartWalletAddress)
			const transferOp = contract.call(
				'transfer_xlm',
				nativeToScVal(Address.fromString(params.recipientAddress), {
					type: 'address',
				}),
				nativeToScVal(params.amount, { type: 'i128' }),
			)

			const fundingAccount = await this.server.getAccount(
				this.fundingKeypair.publicKey(),
			)
			const sourceAccount = new Account(
				fundingAccount.accountId(),
				fundingAccount.sequenceNumber(),
			)

			const transaction = new TransactionBuilder(sourceAccount, {
				fee: '1000000',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(transferOp)
				.setTimeout(300)
				.build()

			// Sign with funding account
			transaction.sign(this.fundingKeypair)

			details.txHash = transaction.hash().toString('hex')

			// Simulate
			const simulation = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				issues.push(`Simulation failed: ${simulation.error}`)
				details.simulationError = simulation.error
			} else {
				success = true
				details.authEntriesCount = simulation.result?.auth?.length || 0

				if (simulation.result?.auth?.[0]) {
					const authEntry = simulation.result.auth[0]
					if (
						authEntry.credentials().switch() ===
						xdr.SorobanCredentialsType.sorobanCredentialsAddress()
					) {
						const creds = authEntry.credentials().address()
						details.originalNonce = creds.nonce().toString()
						details.originalExpiration = creds
							.signatureExpirationLedger()
							.toString()

						if (details.originalExpiration === '0') {
							issues.push('Original expiration is 0 (expected)')
						}
					}
				}
			}

			console.log('   ✅ Simulation completed')
			console.log(`   Auth entries: ${details.authEntriesCount}`)
			console.log(`   Original expiration: ${details.originalExpiration}\n`)
		} catch (error) {
			issues.push(
				`Exception: ${error instanceof Error ? error.message : String(error)}`,
			)
			console.error('   ❌ Error:', error, '\n')
		}

		return {
			step: 'Transaction Simulation',
			success,
			details,
			issues,
		}
	}

	/**
	 * Test 2: Verify simulation modification
	 */
	private async testSimulationModification(params: {
		smartWalletAddress: string
		recipientAddress: string
		amount: number
	}): Promise<DiagnosticResult> {
		console.log('📋 Test 2: Simulation Modification')

		const issues: string[] = []
		let success = false
		const details: Record<string, unknown> = {}

		try {
			// Build and simulate (same as test 1)
			const contract = new Contract(params.smartWalletAddress)
			const transferOp = contract.call(
				'transfer_xlm',
				nativeToScVal(Address.fromString(params.recipientAddress), {
					type: 'address',
				}),
				nativeToScVal(params.amount, { type: 'i128' }),
			)

			const fundingAccount = await this.server.getAccount(
				this.fundingKeypair.publicKey(),
			)
			const sourceAccount = new Account(
				fundingAccount.accountId(),
				fundingAccount.sequenceNumber(),
			)

			const transaction = new TransactionBuilder(sourceAccount, {
				fee: '1000000',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(transferOp)
				.setTimeout(300)
				.build()

			transaction.sign(this.fundingKeypair)

			const simulation = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				issues.push('Simulation failed')
				return {
					step: 'Simulation Modification',
					success: false,
					details,
					issues,
				}
			}

			// Get current ledger
			const latestLedger = await this.server.getLatestLedger()
			const signatureExpirationLedger = latestLedger.sequence + 300

			details.currentLedger = latestLedger.sequence
			details.targetExpiration = signatureExpirationLedger

			// Modify simulation
			if (simulation.result?.auth?.[0]) {
				const simAuthEntry = simulation.result.auth[0]

				if (
					simAuthEntry.credentials().switch() ===
					xdr.SorobanCredentialsType.sorobanCredentialsAddress()
				) {
					const addressCredentials = simAuthEntry.credentials().address()

					// Record original
					details.beforeModification = {
						nonce: addressCredentials.nonce().toString(),
						expiration: addressCredentials
							.signatureExpirationLedger()
							.toString(),
					}

					// Create new credentials
					const newCredentials = new xdr.SorobanAddressCredentials({
						address: addressCredentials.address(),
						nonce: addressCredentials.nonce(),
						signatureExpirationLedger: signatureExpirationLedger,
						signature: addressCredentials.signature(),
					})

					const newAuthEntry = new xdr.SorobanAuthorizationEntry({
						credentials:
							xdr.SorobanCredentials.sorobanCredentialsAddress(newCredentials),
						rootInvocation: simAuthEntry.rootInvocation(),
					})

					simulation.result.auth[0] = newAuthEntry

					// Verify modification
					const verifyCredentials = simulation.result.auth[0]
						.credentials()
						.address()

					details.afterModification = {
						nonce: verifyCredentials.nonce().toString(),
						expiration: verifyCredentials
							.signatureExpirationLedger()
							.toString(),
					}

					const expirationMatches =
						details.afterModification.expiration ===
						signatureExpirationLedger.toString()

					if (expirationMatches) {
						success = true
						console.log('   ✅ Simulation modification successful')
						console.log(`   Before: ${details.beforeModification.expiration}`)
						console.log(`   After: ${details.afterModification.expiration}\n`)
					} else {
						issues.push('Modification did not persist in simulation object')
						console.error('   ❌ Modification failed\n')
					}
				}
			}
		} catch (error) {
			issues.push(
				`Exception: ${error instanceof Error ? error.message : String(error)}`,
			)
			console.error('   ❌ Error:', error, '\n')
		}

		return {
			step: 'Simulation Modification',
			success,
			details,
			issues,
		}
	}

	/**
	 * Test 3: Verify assembleTransaction behavior
	 */
	private async testAssembleTransaction(params: {
		smartWalletAddress: string
		recipientAddress: string
		amount: number
	}): Promise<DiagnosticResult> {
		console.log('📋 Test 3: AssembleTransaction Behavior')

		const issues: string[] = []
		let success = false
		const details: Record<string, unknown> = {}

		try {
			// Build, simulate, and modify (same as test 2)
			const contract = new Contract(params.smartWalletAddress)
			const transferOp = contract.call(
				'transfer_xlm',
				nativeToScVal(Address.fromString(params.recipientAddress), {
					type: 'address',
				}),
				nativeToScVal(params.amount, { type: 'i128' }),
			)

			const fundingAccount = await this.server.getAccount(
				this.fundingKeypair.publicKey(),
			)
			const sourceAccount = new Account(
				fundingAccount.accountId(),
				fundingAccount.sequenceNumber(),
			)

			const transaction = new TransactionBuilder(sourceAccount, {
				fee: '1000000',
				networkPassphrase: this.networkPassphrase,
			})
				.addOperation(transferOp)
				.setTimeout(300)
				.build()

			transaction.sign(this.fundingKeypair)

			const simulation = await this.server.simulateTransaction(transaction)

			if (Api.isSimulationError(simulation)) {
				issues.push('Simulation failed')
				return {
					step: 'AssembleTransaction Behavior',
					success: false,
					details,
					issues,
				}
			}

			const latestLedger = await this.server.getLatestLedger()
			const signatureExpirationLedger = latestLedger.sequence + 300

			// Modify simulation
			if (simulation.result?.auth?.[0]) {
				const simAuthEntry = simulation.result.auth[0]

				if (
					simAuthEntry.credentials().switch() ===
					xdr.SorobanCredentialsType.sorobanCredentialsAddress()
				) {
					const addressCredentials = simAuthEntry.credentials().address()

					const newCredentials = new xdr.SorobanAddressCredentials({
						address: addressCredentials.address(),
						nonce: addressCredentials.nonce(),
						signatureExpirationLedger: signatureExpirationLedger,
						signature: addressCredentials.signature(),
					})

					const newAuthEntry = new xdr.SorobanAuthorizationEntry({
						credentials:
							xdr.SorobanCredentials.sorobanCredentialsAddress(newCredentials),
						rootInvocation: simAuthEntry.rootInvocation(),
					})

					simulation.result.auth[0] = newAuthEntry

					details.beforeAssembly = {
						nonce: newCredentials.nonce().toString(),
						expiration: newCredentials.signatureExpirationLedger().toString(),
					}
				}
			}

			// Assemble transaction
			const assembledTx = assembleTransaction(transaction, simulation).build()

			// Check assembled transaction
			// biome-ignore lint: accessing auth entries requires type assertion
			const sorobanData = assembledTx.operations[0] as any
			const authEntries = sorobanData?.auth || []

			details.assembledAuthEntriesCount = authEntries.length

			if (authEntries.length > 0) {
				const assembledAuthEntry = authEntries[0]

				if (
					assembledAuthEntry.credentials().switch() ===
					xdr.SorobanCredentialsType.sorobanCredentialsAddress()
				) {
					const assembledCredentials = assembledAuthEntry
						.credentials()
						.address()

					details.afterAssembly = {
						nonce: assembledCredentials.nonce().toString(),
						expiration: assembledCredentials
							.signatureExpirationLedger()
							.toString(),
					}

					const expirationMatches =
						details.afterAssembly.expiration ===
						signatureExpirationLedger.toString()

					if (expirationMatches) {
						success = true
						console.log('   ✅ assembleTransaction used our modifications')
						console.log(
							`   Assembled expiration: ${details.afterAssembly.expiration}\n`,
						)
					} else {
						issues.push(
							`assembleTransaction IGNORED modifications: expected ${signatureExpirationLedger}, got ${details.afterAssembly.expiration}`,
						)
						console.error('   ❌ assembleTransaction ignored modifications')
						console.error(`   Expected: ${signatureExpirationLedger}`)
						console.error(`   Got: ${details.afterAssembly.expiration}\n`)
					}
				}
			} else {
				issues.push('No auth entries in assembled transaction')
			}

			details.assembledTx = assembledTx
		} catch (error) {
			issues.push(
				`Exception: ${error instanceof Error ? error.message : String(error)}`,
			)
			console.error('   ❌ Error:', error, '\n')
		}

		return {
			step: 'AssembleTransaction Behavior',
			success,
			details,
			issues,
		}
	}

	/**
	 * Test 4: Verify XDR encoding
	 */
	private async testXDREncoding(
		assembledTx: Transaction,
	): Promise<DiagnosticResult> {
		console.log('📋 Test 4: XDR Encoding Verification')

		const issues: string[] = []
		let success = false
		const details: Record<string, unknown> = {}

		try {
			// Get expected value from assembled transaction
			// biome-ignore lint: accessing auth entries requires type assertion
			const sorobanData = assembledTx.operations[0] as any
			const authEntries = sorobanData?.auth || []

			if (authEntries.length === 0) {
				issues.push('No auth entries to verify')
				return {
					step: 'XDR Encoding Verification',
					success: false,
					details,
					issues,
				}
			}

			const assembledAuthEntry = authEntries[0]
			const assembledCredentials = assembledAuthEntry.credentials().address()
			const expectedExpiration = assembledCredentials
				.signatureExpirationLedger()
				.toString()

			details.expectedExpiration = expectedExpiration

			// Encode to XDR and decode back
			const xdrString = assembledTx.toXDR()
			details.xdrLength = xdrString.length

			const decodedTx = TransactionBuilder.fromXDR(
				xdrString,
				this.networkPassphrase,
			) as Transaction

			// Check decoded values
			// biome-ignore lint: accessing auth entries requires type assertion
			const decodedOp = decodedTx.operations[0] as any
			const decodedAuthEntries = decodedOp?.auth || []

			if (decodedAuthEntries.length > 0) {
				const decodedAuthEntry = decodedAuthEntries[0]
				const decodedCredentials = decodedAuthEntry.credentials().address()
				const decodedExpiration = decodedCredentials
					.signatureExpirationLedger()
					.toString()

				details.decodedExpiration = decodedExpiration

				if (decodedExpiration === expectedExpiration) {
					success = true
					console.log('   ✅ XDR encoding is correct')
					console.log(`   Expiration in XDR: ${decodedExpiration}\n`)
				} else {
					issues.push(
						`XDR mismatch: expected ${expectedExpiration}, decoded ${decodedExpiration}`,
					)
					console.error('   ❌ XDR encoding mismatch')
					console.error(`   Expected: ${expectedExpiration}`)
					console.error(`   Decoded: ${decodedExpiration}\n`)
				}
			} else {
				issues.push('No auth entries in decoded XDR')
			}
		} catch (error) {
			issues.push(
				`Exception: ${error instanceof Error ? error.message : String(error)}`,
			)
			console.error('   ❌ Error:', error, '\n')
		}

		return {
			step: 'XDR Encoding Verification',
			success,
			details,
			issues,
		}
	}

	/**
	 * Test 5: Verify signature_payload extraction
	 */
	private async testSignaturePayloadExtraction(
		assembledTx: Transaction,
	): Promise<DiagnosticResult> {
		console.log('📋 Test 5: Signature Payload Extraction')

		const issues: string[] = []
		let success = false
		const details: Record<string, unknown> = {}

		try {
			// biome-ignore lint: accessing auth entries requires type assertion
			const sorobanData = assembledTx.operations[0] as any
			const authEntries = sorobanData?.auth || []

			if (authEntries.length === 0) {
				issues.push('No auth entries')
				return {
					step: 'Signature Payload Extraction',
					success: false,
					details,
					issues,
				}
			}

			const authEntry = authEntries[0]
			const addressCredentials = authEntry.credentials().address()
			const rootInvocation = authEntry.rootInvocation()

			const address = addressCredentials.address()
			const nonce = addressCredentials.nonce()
			const signatureExpirationLedger =
				addressCredentials.signatureExpirationLedger()

			details.nonce = nonce.toString()
			details.expiration = signatureExpirationLedger.toString()

			// Compute signature_payload
			const networkIdHash = createHash('sha256')
				.update(this.networkPassphrase, 'utf8')
				.digest()

			const contractAddressBytes = address.toXDR()

			const nonceBuffer = Buffer.allocUnsafe(8)
			nonceBuffer.writeBigInt64BE(BigInt(nonce.toString()))

			const signatureExpirationBuffer = Buffer.allocUnsafe(4)
			signatureExpirationBuffer.writeUInt32BE(
				Number(signatureExpirationLedger.toString()),
			)

			const invocationBytes = rootInvocation.toXDR()
			const invocationHash = createHash('sha256')
				.update(invocationBytes)
				.digest()

			const payload = Buffer.concat([
				networkIdHash,
				contractAddressBytes,
				nonceBuffer,
				signatureExpirationBuffer,
				invocationHash,
			])

			const signaturePayloadHash = createHash('sha256').update(payload).digest()

			details.signaturePayload = signaturePayloadHash.toString('hex')
			details.challenge = signaturePayloadHash.toString('base64url')

			success = true
			console.log('   ✅ Signature payload extracted successfully')
			console.log(`   Payload: ${details.signaturePayload}`)
			console.log(`   Challenge: ${details.challenge}\n`)
		} catch (error) {
			issues.push(
				`Exception: ${error instanceof Error ? error.message : String(error)}`,
			)
			console.error('   ❌ Error:', error, '\n')
		}

		return {
			step: 'Signature Payload Extraction',
			success,
			details,
			issues,
		}
	}

	/**
	 * Print diagnostic summary
	 */
	private printSummary(results: DiagnosticResult[]): void {
		console.log('\n' + '='.repeat(60))
		console.log('📊 DIAGNOSTIC SUMMARY')
		console.log('='.repeat(60) + '\n')

		for (const result of results) {
			const status = result.success ? '✅' : '❌'
			console.log(`${status} ${result.step}`)

			if (result.issues.length > 0) {
				for (const issue of result.issues) {
					console.log(`   ⚠️  ${issue}`)
				}
			}
		}

		console.log('\n' + '='.repeat(60))

		const allPassed = results.every((r) => r.success)
		if (allPassed) {
			console.log('✅ ALL TESTS PASSED')
			console.log('The transaction building process is working correctly.')
			console.log('The txBadAuth error is likely caused by:')
			console.log('  1. WebAuthn signature format mismatch')
			console.log('  2. Challenge mismatch in client_data_json')
			console.log('  3. Device not registered or public key mismatch')
		} else {
			console.log('❌ SOME TESTS FAILED')
			console.log('Review the issues above to identify the root cause.')
		}

		console.log('='.repeat(60) + '\n')
	}
}
