import { appEnvConfig } from '@packages/lib/config'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SmartWalletDiagnostics } from '~/lib/stellar/diagnostic-test'

/**
 * POST /api/stellar/diagnostics
 *
 * Run comprehensive diagnostic tests on smart wallet transaction building
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { smartWalletAddress, recipientAddress, amount } = body

		// Validate inputs
		if (!smartWalletAddress || !recipientAddress || !amount) {
			return NextResponse.json(
				{
					error:
						'Missing required fields: smartWalletAddress, recipientAddress, amount',
				},
				{ status: 400 },
			)
		}

		// Get configuration
		const config = appEnvConfig('web')

		// Initialize diagnostics
		const diagnostics = new SmartWalletDiagnostics(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		// Run tests
		const results = await diagnostics.runDiagnostics({
			smartWalletAddress,
			recipientAddress,
			amount: Number(amount),
		})

		return NextResponse.json({
			success: true,
			data: {
				results,
				allPassed: results.every((r) => r.success),
			},
		})
	} catch (error) {
		console.error('Error running diagnostics:', error)
		return NextResponse.json(
			{
				error: 'Failed to run diagnostics',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
