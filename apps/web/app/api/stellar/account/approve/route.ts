import { appEnvConfig } from '@packages/lib'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/stellar/account/approve
 *
 * Register a smart wallet account in the auth-controller
 * This must be done before the account can perform authenticated operations
 *
 * Proxies to KYC server's registerAccountOnChain function
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { accountAddress } = body

		if (!accountAddress) {
			return NextResponse.json(
				{ error: 'Missing required field: accountAddress' },
				{ status: 400 },
			)
		}

		const config = appEnvConfig('web')
		// KYC server URL - use environment variable or default to localhost
		const kycServerUrl = config.externalApis.kyc.baseUrl

		console.log('🔐 Registering account in auth-controller via KYC server')
		console.log('   Account:', accountAddress)
		console.log('   KYC Server:', kycServerUrl)

		// Call KYC server's create-passkey-account endpoint
		// which handles the auth-controller registration
		const response = await fetch(
			`${kycServerUrl}/api/stellar/create-passkey-account`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					contractAddress: accountAddress,
					contexts: [accountAddress], // Register with self as context
				}),
			},
		)

		if (!response.ok) {
			const errorData = await response.json()
			console.error('❌ KYC server error:', errorData)
			throw new Error(errorData.error || 'Failed to register account')
		}

		const result = await response.json()

		console.log('✅ Account registered successfully')
		console.log('   Transaction hash:', result.data?.transactionHash)

		return NextResponse.json({
			success: true,
			data: {
				hash: result.data?.transactionHash,
				status: 'success',
				message: result.message,
			},
		})
	} catch (error) {
		console.error('❌ Error approving account:', error)
		return NextResponse.json(
			{
				error: 'Failed to approve account',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
