import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { contractInvokeSchema } from '~/lib/schemas/stellar.schemas'
import { SmartWalletTransactionService } from '~/lib/stellar/smart-wallet-transactions'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/stellar/contract/invoke
 *
 * Invoke arbitrary contract function from smart wallet
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const validation = validateRequest(contractInvokeSchema, body)
		if (!validation.success) return validation.response
		const { from, contractAddress, functionName, args, sponsorFees } = validation.data

		// Initialize service
		const txService = new SmartWalletTransactionService(
			process.env.STELLAR_NETWORK_PASSPHRASE,
			process.env.STELLAR_RPC_URL,
			process.env.STELLAR_FUNDING_SECRET_KEY,
		)

		// Build transaction
		const result = await txService.invokeContract({
			from,
			contractAddress,
			functionName,
			args,
			sponsorFees,
		})

		return NextResponse.json({
			success: true,
			data: {
				challenge: result.challenge,
				transactionXDR: result.transactionXDR,
				hash: result.hash,
			},
		})
	} catch (error) {
		console.error('Error preparing contract invocation:', error)
		return NextResponse.json(
			{
				error: 'Failed to prepare contract invocation',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
