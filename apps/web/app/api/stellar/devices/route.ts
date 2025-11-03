import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/stellar/devices
 *
 * Execute passkey device operations on smart wallet contracts
 * Operations: add_device, remove_device, invoke_contract
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { address, operation, signature } = body

		if (!address || !operation || !signature) {
			return NextResponse.json(
				{ error: 'Missing required parameters: address, operation, signature' },
				{ status: 400 },
			)
		}

		// TODO: Import and initialize StellarPasskeyService from web app
		// For now, this is a placeholder that should call the kyc-server API
		// or implement the StellarPasskeyService in the web app

		// Call kyc-server API (recommended for now)
		const kycServerUrl = process.env.KYC_SERVER_URL || 'http://localhost:3001'
		const response = await fetch(
			`${kycServerUrl}/api/stellar/execute-transaction`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ address, operation, signature }),
			},
		)

		if (!response.ok) {
			const errorData = await response.json()
			return NextResponse.json(
				{
					error: 'Failed to execute device operation',
					details: errorData.error || errorData.details,
				},
				{ status: response.status },
			)
		}

		const data = await response.json()

		return NextResponse.json({
			success: true,
			transactionHash: data.transactionHash,
		})

		// TODO: Implement StellarPasskeyService in web app (future)
		// const stellarService = new StellarPasskeyService(
		//   process.env.STELLAR_NETWORK_PASSPHRASE,
		//   process.env.STELLAR_RPC_URL,
		//   process.env.STELLAR_FUNDING_SECRET_KEY,
		// )
		//
		// const transactionHash = await stellarService.executePasskeyTransaction(
		//   address,
		//   operation,
		//   signature,
		// )
		//
		// return NextResponse.json({
		//   success: true,
		//   transactionHash,
		// })
	} catch (error) {
		console.error('Error executing device operation:', error)
		return NextResponse.json(
			{
				error: 'Failed to execute device operation',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
