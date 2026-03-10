import { appEnvConfig } from '@packages/lib/config'
import { faucetSchema } from '~/lib/schemas/stellar.schemas'
import { validateRequest } from '~/lib/utils/validation'
import {
	Address,
	Asset,
	Contract,
	Keypair,
	nativeToScVal,
	Operation,
	TransactionBuilder,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/stellar/faucet
 *
 * Fund a smart wallet with initial XLM for testing
 * This is a testnet-only endpoint for development
 */
export async function POST(req: NextRequest) {
	try {
		const config = appEnvConfig('web')

		// Security check: Only allow on testnet
		if (
			!config.stellar.networkPassphrase.includes('Test') &&
			config.env.appEnv !== 'development'
		) {
			return NextResponse.json(
				{
					error: 'Faucet only available on testnet',
				},
				{ status: 403 },
			)
		}

		const body = await req.json()
		const validation = validateRequest(faucetSchema, { ...body, amount: body.amount ?? '10' })
		if (!validation.success) {
			return validation.response
		}
		const { address, amount: fundAmount } = validation.data

		console.log('💰 Funding smart wallet:', {
			address,
			amount: `${fundAmount} XLM`,
		})

		// Initialize funding account
		const fundingKeypair = Keypair.fromSecret(config.stellar.fundingAccount)

		// Get funding account details from Horizon
		const horizonUrl = config.stellar.horizonUrl
		const horizonResponse = await fetch(
			`${horizonUrl}/accounts/${fundingKeypair.publicKey()}`,
		)

		if (!horizonResponse.ok) {
			throw new Error('Failed to fetch funding account from Horizon')
		}

		const fundingAccountData = await horizonResponse.json()

		// Determine if this is a contract address (C...) or regular account (G...)
		const isContractAddress = address.startsWith('C')

		let result: { hash: string }

		if (isContractAddress) {
			console.log('🔧 Funding contract address via SAC...')
			result = await fundContractViaSAC(
				config,
				address,
				fundAmount,
				fundingKeypair,
				fundingAccountData,
			)
		} else {
			console.log('💳 Funding regular account via Horizon...')
			result = await fundAccountViaHorizon(
				horizonUrl,
				address,
				fundAmount,
				fundingKeypair,
				fundingAccountData,
				config.stellar.networkPassphrase,
			)
		}

		console.log('✅ Smart wallet funded successfully:', result.hash)

		return NextResponse.json({
			success: true,
			data: {
				txHash: result.hash,
				amount: fundAmount,
				address,
				message: `Successfully funded ${address} with ${fundAmount} XLM`,
			},
		})
	} catch (error) {
		console.error('❌ Error funding smart wallet:', error)
		return NextResponse.json(
			{
				error: 'Failed to fund smart wallet',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}

/**
 * Fund a contract address using Native XLM SAC transfer
 */
async function fundContractViaSAC(
	config: ReturnType<typeof appEnvConfig>,
	contractAddress: string,
	amount: number,
	fundingKeypair: Keypair,
	fundingAccountData: { account_id: string; sequence: string },
): Promise<{ hash: string }> {
	const server = new Server(config.stellar.rpcUrl)

	// Get Native XLM SAC contract address
	const nativeAsset = Asset.native()
	const xlmSacAddress = nativeAsset.contractId(config.stellar.networkPassphrase)
	const xlmSacContract = new Contract(xlmSacAddress)

	console.log('� Using XLM SAC:', xlmSacAddress)
	console.log('   Amount (stroops):', Math.floor(amount * 10_000_000))

	// Build SAC transfer transaction
	const transaction = new TransactionBuilder(
		{
			accountId: () => fundingAccountData.account_id,
			sequenceNumber: () => fundingAccountData.sequence,
			incrementSequenceNumber: () => {
				fundingAccountData.sequence = (
					Number.parseInt(fundingAccountData.sequence, 10) + 1
				).toString()
			},
		},
		{
			fee: '100000',
			networkPassphrase: config.stellar.networkPassphrase,
		},
	)
		.addOperation(
			xlmSacContract.call(
				'transfer',
				nativeToScVal(Address.fromString(fundingKeypair.publicKey()), {
					type: 'address',
				}),
				nativeToScVal(Address.fromString(contractAddress), { type: 'address' }),
				nativeToScVal(Math.floor(amount * 10_000_000), { type: 'i128' }),
			),
		)
		.setTimeout(180)
		.build()

	// Simulate transaction
	console.log('🔄 Simulating SAC transfer...')
	const simulation = await server.simulateTransaction(transaction)

	console.log('📊 Simulation result:', JSON.stringify(simulation, null, 2))

	if (Api.isSimulationError(simulation)) {
		console.error('❌ Simulation error:', JSON.stringify(simulation, null, 2))
		throw new Error(
			`SAC transfer simulation failed: ${JSON.stringify(simulation)}`,
		)
	}

	console.log('✅ Simulation successful, assembling transaction...')

	// Assemble with simulation results
	const assembledTx = assembleTransaction(transaction, simulation).build()
	assembledTx.sign(fundingKeypair)

	// Submit to network
	console.log('🚀 Submitting SAC transfer...')
	const submitResult = await server.sendTransaction(assembledTx)

	console.log('📤 Submit result:', submitResult)

	if (submitResult.status === 'ERROR') {
		console.error('❌ Submit error:', submitResult)
		throw new Error(`SAC transfer submission failed: ${submitResult.status}`)
	}

	// Return immediately with the transaction hash
	// The network will process it asynchronously
	console.log('✅ Transaction submitted successfully:', submitResult.hash)
	console.log('🔗 Check status on Stellar Expert:')
	console.log(
		`   https://stellar.expert/explorer/testnet/tx/${submitResult.hash}`,
	)

	return { hash: submitResult.hash }
}

/**
 * Fund a regular account using Horizon payment operation
 */
async function fundAccountViaHorizon(
	horizonUrl: string,
	accountAddress: string,
	amount: number,
	fundingKeypair: Keypair,
	fundingAccountData: { account_id: string; sequence: string },
	networkPassphrase: string,
): Promise<{ hash: string }> {
	// Build payment transaction
	const transaction = new TransactionBuilder(
		{
			accountId: () => fundingAccountData.account_id,
			sequenceNumber: () => fundingAccountData.sequence,
			incrementSequenceNumber: () => {
				fundingAccountData.sequence = (
					Number.parseInt(fundingAccountData.sequence, 10) + 1
				).toString()
			},
		},
		{
			fee: '100000',
			networkPassphrase,
		},
	)
		.addOperation(
			Operation.payment({
				destination: accountAddress,
				asset: Asset.native(),
				amount: amount.toString(),
			}),
		)
		.setTimeout(180)
		.build()

	// Sign transaction
	transaction.sign(fundingKeypair)

	// Submit to Horizon API
	const submitResponse = await fetch(`${horizonUrl}/transactions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: `tx=${encodeURIComponent(transaction.toXDR())}`,
	})

	if (!submitResponse.ok) {
		const errorData = await submitResponse.json()
		console.error('❌ Horizon submission error:', errorData)
		throw new Error(
			errorData.extras?.result_codes?.operations?.[0] ||
				errorData.title ||
				'Transaction failed',
		)
	}

	const result = await submitResponse.json()
	return { hash: result.hash }
}
