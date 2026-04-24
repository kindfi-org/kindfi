// TODO: Use the queryContractDevices here to check approval status
// ! queryContractDevices returns the deviceID and the publicKey already parsed as base64
// ! We need to check if the address is in the list of approved accounts in the auth-controller by asking for the credential_id in their devices off-chain

import { appEnvConfig } from '@packages/lib/config'
import { Contract, nativeToScVal } from '@stellar/stellar-sdk'
import { Server } from '@stellar/stellar-sdk/rpc'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { addressParamSchema } from '~/lib/schemas/stellar.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * GET /api/stellar/account/check-approval/[address]
 *
 * Check if a smart wallet account is registered in the auth-controller
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ address: string }> },
) {
	try {
		const { address } = await params
		const validation = validateRequest(addressParamSchema, { address })
		if (!validation.success) return validation.response
		const { address: validatedAddress } = validation.data

		const config = appEnvConfig('web')
		const server = new Server(config.stellar.rpcUrl)


		// Build get_accounts invocation with empty context
		const authController = new Contract(config.stellar.controllerContractId)
		const getAccountsOp = authController.call(
			'get_accounts',
			nativeToScVal([], { type: 'Vec' }), // Empty context array
		)

		// Create a dummy source account for simulation
		const dummySource = {
			accountId: () => config.stellar.fundingAccount.substring(0, 56),
			sequenceNumber: () => '0',
			incrementSequenceNumber: () => {},
		}

		const { TransactionBuilder } = await import('@stellar/stellar-sdk')
		const transaction = new TransactionBuilder(dummySource, {
			fee: '100000',
			networkPassphrase: config.stellar.networkPassphrase,
		})
			.addOperation(getAccountsOp)
			.setTimeout(30)
			.build()

		// Simulate to read contract state
		const simulation = await server.simulateTransaction(transaction)

		// Check if account is in the list
		const isApproved = false
		if (!('error' in simulation) && simulation.result?.retval) {
			// Parse the result (should be a Vec<Address>)
			// For now, we'll just return that we need to check the result
			// TODO: Parse the ScVal result properly
		}

		return NextResponse.json({
			success: true,
			data: {
				address: validatedAddress,
				isApproved,
				note: 'Account approval check - implementation needs ScVal parsing',
			},
		})
	} catch (error) {
		console.error('❌ Error checking account approval:', error)
		return NextResponse.json(
			{
				error: 'Failed to check account approval',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
