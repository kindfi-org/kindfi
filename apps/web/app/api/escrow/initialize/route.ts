import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { error, requireSession, respond } from '~/lib/api-helpers'
import { AppError } from '~/lib/error'
import { escrowInitializeSchema } from '~/lib/schemas/escrow.schemas'
import { AuditLogger } from '~/lib/services/audit-logger'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import { generateUniqueId } from '~/lib/utils/id'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: NextRequest) {
	const { user, error: authError } = await requireSession()
	if (authError) return authError

	const auditLogger = new AuditLogger()
	const correlationId = generateUniqueId('audit-')
	const startTime = Date.now()

	try {
		const body = await req.json()
		const validation = validateRequest(escrowInitializeSchema, body)
		if (!validation.success) {
			await auditLogger.log({
				correlationId,
				operation: 'escrow.initialize',
				resourceType: 'escrow',
				status: 'validation_error',
				durationMs: Date.now() - startTime,
			})
			return validation.response
		}
		const initializationData = body

		/* 2. Create the escrow contract through the initialize escrow - Trustless Work API
		- The Trustless Work API will return an unsigned transaction XDR
		*/
		const responseCreateEscrowRequest = await createEscrowRequest({
			action: 'initiate',
			method: 'POST',
			data: initializationData,
		})

		// Get the unsigned transaction XDR
		const { unsignedTransaction } = responseCreateEscrowRequest

		// 3. Sign the transaction
		// todo: HERE YOU HAVE TO CREATE A FUNCTION TO SIGN THE TRANSACTION
		// const signedTransaction = await signTransaction(unsignedTransaction);
		const signedTxXdr = unsignedTransaction

		// 4. Send the signed transaction to the Stellar network through the send transaction - Trustless Work API
		const response = await sendTransaction(signedTxXdr || '')

		if (response) {
			const { data: dbResult, error: dbError } = await supabase
				.from('escrow_contracts')
				.insert({
					engagement_id: response.escrow.engagementId,
					contract_id: response.contract_id,
					amount: response.escrow.amount,
					platform_fee: response.escrow.platformFee,
					current_state: 'PENDING',
				})
				.select('id')
				.single()

			if (dbError) {
				return error('Failed to track escrow contract', {
					status: 500,
					code: 'DB_INSERT_FAILED',
					details: dbError,
					log: dbError,
				})
			}

			// If successful, update the state to INITIALIZED
			await supabase
				.from('escrow_contracts')
				.update({ current_state: 'INITIALIZED' })
				.eq('id', dbResult.id)

			await auditLogger.log({
				correlationId,
				operation: 'escrow.initialize',
				resourceType: 'escrow',
				resourceId: dbResult.id,
				actorId: user.id,
				status: 'success',
				durationMs: Date.now() - startTime,
				metadata: { contractAddress: response.contract_id },
			})

			return respond(
				{
					escrowId: dbResult.id,
					contractAddress: response.contract_id,
					status: 'INITIALIZED',
				},
				{ status: 201 },
			)
		}
	} catch (err) {
		if (err instanceof AppError) {
			await auditLogger.log({
				correlationId,
				operation: 'escrow.initialize',
				resourceType: 'escrow',
				status: 'failure',
				errorCode: String(err.statusCode),
				durationMs: Date.now() - startTime,
				metadata: { error: err.message },
			})
			return error(err.message, {
				status: err.statusCode,
				code: 'ESCROW_INIT_ERROR',
				details: err.details,
				log: err,
			})
		}

		await auditLogger.log({
			correlationId,
			operation: 'escrow.initialize',
			resourceType: 'escrow',
			status: 'failure',
			errorCode: '500',
			durationMs: Date.now() - startTime,
			metadata: { error: err instanceof Error ? err.message : String(err) },
		})
		return error('Internal server error during escrow initialization', {
			status: 500,
			code: 'INTERNAL_ERROR',
			log: err instanceof Error ? err : true,
		})
	}
}
