import { appEnvConfig } from '@packages/lib/config'
import { TransactionBuilder } from '@stellar/stellar-sdk'
import { Api, Server } from '@stellar/stellar-sdk/rpc'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AuditLogger } from '~/lib/services/audit-logger'
import { signAndSubmitSchema } from '~/lib/schemas/escrow-sign.schemas'
import { generateUniqueId } from '~/lib/utils/id'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/escrow/sign-and-submit
 *
 * Signs an unsigned transaction XDR from Trustless Work SDK using WebAuthn
 * and submits it to the network
 */
export async function POST(req: NextRequest) {
	const auditLogger = new AuditLogger()
	const correlationId = generateUniqueId('audit-')
	const startTime = Date.now()

	try {
		const appConfig = appEnvConfig('web')
		const body = await req.json()
		const validation = validateRequest(signAndSubmitSchema, body)
		if (!validation.success) {
			await auditLogger.log({
				correlationId,
				operation: 'escrow.sign_and_submit',
				resourceType: 'escrow',
				status: 'validation_error',
				durationMs: Date.now() - startTime,
			})
			return validation.response
		}
		const { unsignedTransactionXDR, userDevice } = validation.data

		// Parse the unsigned transaction
		const transaction = TransactionBuilder.fromXDR(
			unsignedTransactionXDR,
			appConfig.stellar.networkPassphrase,
		)

		const server = new Server(appConfig.stellar.rpcUrl)

		// Simulate to get auth requirements
		const simulation = await server.simulateTransaction(transaction, {
			cpuInstructions: 3_500_000,
		})

		if (Api.isSimulationError(simulation)) {
			return NextResponse.json(
				{
					error: 'Transaction simulation failed',
					details: simulation.error,
				},
				{ status: 400 },
			)
		}

		// Get auth entries from simulation
		const authEntries = simulation.result?.auth || []
		if (authEntries.length === 0) {
			return NextResponse.json(
				{
					error: 'No authorization entries found in simulation',
				},
				{ status: 400 },
			)
		}

		// Get the first auth entry (for smart wallet)
		const authEntry = authEntries[0]
		const addressCredentials = authEntry.credentials().address()
		const nonce = addressCredentials.nonce()

		// Convert nonce to hex string (nonce is xdr.Int64, convert via XDR bytes)
		const nonceHex = Buffer.from(nonce.toXDR()).toString('hex')

		// Generate authentication options for WebAuthn
		const authOptionsResponse = await fetch(
			`${process.env.NEXT_PUBLIC_KYC_API_BASE_URL || 'http://localhost:3001'}/api/passkey/generate-authentication-options`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier: userDevice.address,
					userId: userDevice.credential_id,
					challenge: nonceHex,
					origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
				}),
			},
		)

		if (!authOptionsResponse.ok) {
			return NextResponse.json(
				{
					error: 'Failed to generate authentication options',
				},
				{ status: 500 },
			)
		}

		const authOptions = await authOptionsResponse.json()

		await auditLogger.log({
			correlationId,
			operation: 'escrow.sign_and_submit',
			resourceType: 'escrow',
			actorId: userDevice.address ? AuditLogger.maskAddress(userDevice.address) : undefined,
			status: 'success',
			durationMs: Date.now() - startTime,
		})

		// Return auth options to client for WebAuthn signing
		return NextResponse.json({
			authOptions,
			transactionXDR: unsignedTransactionXDR,
			nonce: nonceHex,
			authEntry: authEntry.toXDR('base64'),
		})
	} catch (error) {
		console.error('Error in sign-and-submit:', error)
		await auditLogger.log({
			correlationId,
			operation: 'escrow.sign_and_submit',
			resourceType: 'escrow',
			status: 'failure',
			errorCode: '500',
			durationMs: Date.now() - startTime,
			metadata: { error: error instanceof Error ? error.message : String(error) },
		})
		return NextResponse.json(
			{
				error: 'Failed to prepare transaction for signing',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
