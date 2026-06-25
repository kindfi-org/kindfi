import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getAuthenticatedSession } from '~/lib/auth/server-action-auth'
import { AppError } from '~/lib/error'
import { getEtherfuseConfig } from '~/lib/etherfuse/get-etherfuse-config'
import { resolveEtherfuseOrderContext } from '~/lib/etherfuse/resolve-order-context'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import {
	etherfuseDepositRequestSchema,
	etherfuseDepositResponseSchema,
} from '~/lib/schemas/etherfuse.schemas'
import { AuditLogger } from '~/lib/services/audit-logger'
import { generateUniqueId } from '~/lib/utils/id'
import { validateRequest } from '~/lib/utils/validation'

async function onRampHandler(req: NextRequest) {
	const auditLogger = new AuditLogger()
	const correlationId = generateUniqueId('audit-')
	const startTime = Date.now()

	try {
		const body = await req.json()
		const validation = validateRequest(etherfuseDepositRequestSchema, body)
		if (!validation.success) {
			await auditLogger.log({
				correlationId,
				operation: 'etherfuse.on_ramp',
				resourceType: 'transaction',
				status: 'validation_error',
				durationMs: Date.now() - startTime,
			})
			return validation.response
		}

		const {
			userId,
			amount,
			currency,
			targetAsset,
			walletAddress,
			etherfuseCustomerId,
			etherfuseBankAccountId,
			escrowId,
		} = validation.data

		const session = await getAuthenticatedSession()
		if (!session?.user?.id || session.user.id !== userId) {
			await auditLogger.log({
				correlationId,
				operation: 'etherfuse.on_ramp',
				resourceType: 'transaction',
				status: 'failure',
				errorCode: '403',
				durationMs: Date.now() - startTime,
				metadata: { error: 'Unauthorized: User ID does not match authenticated user' },
			})
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		if (!etherfuseCustomerId || !etherfuseBankAccountId) {
			return NextResponse.json(
				{
					error: 'Complete Etherfuse verification for this wallet before creating a deposit order.',
				},
				{ status: 400 },
			)
		}

		const config = await getEtherfuseConfig()
		const orderContext = await resolveEtherfuseOrderContext(config, walletAddress, {
			customerId: etherfuseCustomerId,
			bankAccountId: etherfuseBankAccountId,
		})
		const { apiKey, baseUrl } = config
		const { customerId: quoteCustomerId, bankAccountId, cryptoWalletId, publicKey } = orderContext

		// Step 1: Create a quote
		const quoteId = crypto.randomUUID()
		const quoteResponse = await fetch(`${baseUrl}/ramp/quote`, {
			method: 'POST',
			headers: {
				Authorization: apiKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				quoteId,
				customerId: quoteCustomerId,
				blockchain: 'stellar',
				quoteAssets: {
					type: 'onramp',
					sourceAsset: currency,
					targetAsset,
				},
				sourceAmount: amount,
				walletAddress,
			}),
		})

		if (!quoteResponse.ok) {
			const errorText = await quoteResponse.text()
			logger.error('Etherfuse quote creation failed', { status: quoteResponse.status, body: errorText })
			throw new AppError('Failed to create on-ramp quote', quoteResponse.status)
		}

		const quoteData = await quoteResponse.json()

		// Step 2: Create an order
		const orderId = crypto.randomUUID()
		const orderResponse = await fetch(`${baseUrl}/ramp/order`, {
			method: 'POST',
			headers: {
				Authorization: apiKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				orderId,
				bankAccountId,
				cryptoWalletId,
				publicKey,
				quoteId: quoteData.quoteId,
			}),
		})

		if (!orderResponse.ok) {
			const errorText = await orderResponse.text()
			logger.error('Etherfuse order creation failed', { status: orderResponse.status, body: errorText })
			throw new AppError('Failed to create on-ramp order', orderResponse.status)
		}

		const orderData = await orderResponse.json()

		// Step 3: Store transaction in database
		const { data: dbResult, error: dbError } = await supabase
			.from('transactions')
			.insert({
				transaction_hash: orderData.orderId,
				user_id: userId,
				project_id: escrowId || null,
				amount,
				transaction_type: 'DEPOSIT',
				status: 'PENDING',
				metadata: {
					provider: 'etherfuse',
					quoteId: quoteData.quoteId,
					orderId: orderData.orderId,
					currency,
					targetAsset,
					walletAddress: AuditLogger.maskAddress(walletAddress),
					statusPage: orderData.statusPage,
				},
			})
			.select('id')
			.single()

		if (dbError) {
			logger.error('Failed to store transaction:', dbError)
			// Don't throw - the order was created successfully, just log the error
		}

		await auditLogger.log({
			correlationId,
			operation: 'etherfuse.on_ramp',
			resourceType: 'transaction',
			resourceId: dbResult?.id,
			actorId: userId,
			status: 'success',
			durationMs: Date.now() - startTime,
			metadata: {
				quoteId: quoteData.quoteId,
				orderId: orderData.orderId,
				amount,
				currency,
				targetAsset,
				walletAddress: AuditLogger.maskAddress(walletAddress),
			},
		})

		return NextResponse.json(
			{
				success: true,
				quoteId: quoteData.quoteId,
				orderId: orderData.orderId,
				statusPage: orderData.statusPage,
				message:
					'On-ramp order created successfully. Please complete the deposit using the provided instructions.',
			},
			{ status: 201 },
		)
	} catch (error) {
		logger.error('Etherfuse On-Ramp Error:', error)

		if (error instanceof AppError) {
			await auditLogger.log({
				correlationId,
				operation: 'etherfuse.on_ramp',
				resourceType: 'transaction',
				status: 'failure',
				errorCode: String(error.statusCode),
				durationMs: Date.now() - startTime,
				metadata: { error: error.message },
			})
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: error.statusCode },
			)
		}

		await auditLogger.log({
			correlationId,
			operation: 'etherfuse.on_ramp',
			resourceType: 'transaction',
			status: 'failure',
			errorCode: '500',
			durationMs: Date.now() - startTime,
			metadata: { error: error instanceof Error ? error.message : String(error) },
		})

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}

export const POST = withRateLimit(
	{
		preset: 'strict',
		identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous',
	},
	onRampHandler,
)
