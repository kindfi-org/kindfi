import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { requireSmartAccountFeature } from '@/lib/smart-account/guards/require-smart-account-feature'
import { submitSmartAccountTransferWithWebAuthn } from '@/lib/smart-account/transactions/submit-with-webauthn.service'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { requireKycAuthorization } from '~/lib/kyc/denial'
import { getKycEnforcementMode } from '~/lib/kyc/enforcement-config'
import { transferSubmitSchema } from '~/lib/schemas/stellar.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/stellar/transfer/submit
 *
 * Submit a signed transaction to the network with WebAuthn signature assembly
 */
export async function POST(req: NextRequest) {
	try {
		const featureGuard = requireSmartAccountFeature()
		if (featureGuard) return featureGuard

		const session = await getServerSession(nextAuthOption)
		if (session?.user?.id) {
			const kycDecision = await requireKycAuthorization({
				userId: session.user.id,
				action: 'send_assets',
			})
			if (!kycDecision.ok) return kycDecision.response
		} else if (getKycEnforcementMode() === 'enforced') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(transferSubmitSchema, body)
		if (!validation.success) return validation.response
		const { transactionData, authResponse, userDevice, verificationJSON } = validation.data
		const { transactionXDR, hash: _hash } = transactionData

		const result = await submitSmartAccountTransferWithWebAuthn({
			transactionXDR,
			hash: _hash,
			authResponse,
			userDevice,
			verificationJSON,
		})

		return NextResponse.json({
			success: true,
			data: {
				hash: result.hash,
				status: result.status,
			},
		})
	} catch (error) {
		logger.error('❌ Error submitting transfer:', error)
		return NextResponse.json(
			{
				error: 'Failed to submit transfer',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
