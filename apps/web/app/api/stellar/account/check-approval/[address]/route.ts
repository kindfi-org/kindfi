// TODO: Use the queryContractDevices here to check approval status
// ! queryContractDevices returns the deviceID and the publicKey already parsed as base64
// ! We need to check if the address is in the list of approved accounts in the auth-controller by asking for the credential_id in their devices off-chain

import { appEnvConfig } from '@packages/lib/config'
import { Contract, nativeToScVal } from '@stellar/stellar-sdk'
import { Server } from '@stellar/stellar-sdk/rpc'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

		if (!address) {
			return NextResponse.json(
				{ error: 'Missing address parameter' },
				{ status: 400 },
			)
		}

		const config = appEnvConfig('web')
		const server = new Server(config.stellar.rpcUrl)

		console.log('🔍 Checking account approval status')
		console.log('   Account:', address)
		console.log('   Controller:', config.stellar.controllerContractId)

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
			console.log('   Result:', simulation.result.retval)
			// For now, we'll just return that we need to check the result
			// TODO: Parse the ScVal result properly
		}

		return NextResponse.json({
			success: true,
			data: {
				address,
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
