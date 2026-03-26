import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { AuditLogger } from '~/lib/services/audit-logger'
import { sendTransaction } from '~/lib/stellar/utils/send-transaction'
import type { DisputeSignPayload } from '~/lib/types/escrow/escrow-payload.types'
import { generateUniqueId } from '~/lib/utils/id'
import { validateDisputeSign } from '~/lib/validators/dispute'

export async function POST(req: NextRequest) {
	const auditLogger = new AuditLogger()
	const correlationId = generateUniqueId('audit-')
	const startTime = Date.now()

	try {
		// 1. Parse and validate the dispute sign data
		const signData = await req.json()
		const validationResult = validateDisputeSign(signData)

		if (!validationResult.success) {
			await auditLogger.log({
				correlationId,
				operation: 'escrow.dispute.sign',
				resourceType: 'dispute',
				status: 'validation_error',
				durationMs: Date.now() - startTime,
			})
			return NextResponse.json(
				{
					error: 'Invalid dispute sign data',
					details: validationResult.error.format(),
				},
				{ status: 400 },
			)
		}

		const validatedData = validationResult.data as DisputeSignPayload

		const {
			signedTransaction,
			type, // 'file' or 'resolve'
			// For filing a dispute
			escrowId,
			milestoneId,
			filerAddress,
			disputeReason,
			evidenceUrls,
			escrowParticipantId,
			// For resolving a dispute
			disputeId,
			mediatorId,
			resolution,
			resolutionNotes,
			approverAmount,
			serviceProviderAmount,
		} = validatedData

		// 2. Use the signed transaction from the client
		// This follows the non-custodial design pattern where private keys never touch the server
		if (!signedTransaction) {
			throw new Error('No signed transaction provided')
		}

		// 3. Send the signed transaction to the blockchain
		const txResponse = await sendTransaction(signedTransaction)

		if (!txResponse || !txResponse.txHash) {
			throw new Error('Failed to send transaction to the blockchain')
		}

		// 4. Update the database based on the transaction type
		if (type === 'file') {
			// Record the dispute in the database
			const { data: dispute, error: insertError } = await supabase
				.from('escrow_reviews')
				.insert({
					escrow_id: escrowId,
					milestone_id: milestoneId,
					reviewer_address: filerAddress,
					disputer_id: escrowParticipantId,
					review_notes: disputeReason,
					evidence_urls: evidenceUrls,
					transaction_hash: txResponse.txHash,
					status: 'PENDING',
					type: 'dispute',
					created_at: new Date().toISOString(),
				})
				.select('id')
				.single()

			if (insertError) {
				throw new Error(`Failed to record dispute: ${insertError.message}`)
			}

			// Update the milestone status to indicate a dispute is in progress
			const { error: milestoneUpdateError } = await supabase
				.from('escrow_milestones')
				.update({ status: 'disputed' })
				.eq('id', milestoneId)

			if (milestoneUpdateError) {
				throw new Error(
					`Failed to mark milestone as disputed: ${milestoneUpdateError.message}`,
				)
			}

			// Get escrow contract and milestone details for notifications in parallel
			const [escrowResult, milestoneResult] = await Promise.all([
				supabase
					.from('escrow_contracts')
					.select('service_provider_id, approver_id')
					.eq('id', escrowId)
					.single(),
				supabase
					.from('escrow_milestones')
					.select('title')
					.eq('id', milestoneId)
					.single(),
			])

			const { data: escrow, error: escrowError } = escrowResult
			const { data: milestone, error: milestoneError } = milestoneResult

			if (escrowError) {
				console.error('Error fetching escrow contract:', escrowError)
			}
			if (milestoneError) {
				console.error('Error fetching milestone:', milestoneError)
			}

			// Create notifications for all parties involved
			if (escrow && milestone) {
				const { error: notificationError } = await supabase
					.from('notifications')
					.insert([
						{
							user_id: escrow.service_provider_id,
							milestone_id: milestoneId,
							message: `A dispute has been filed for milestone: ${milestone.title}`,
							type: 'DISPUTE_FILED',
						},
						{
							user_id: escrow.approver_id,
							milestone_id: milestoneId,
							message: `A dispute has been filed for milestone: ${milestone.title}`,
							type: 'DISPUTE_FILED',
						},
					])

				if (notificationError) {
					console.error(
						'Error creating dispute filed notifications:',
						notificationError,
					)
					throw new Error(
						`Failed to create dispute filed notifications: ${notificationError.message}`,
					)
				}
			}

			await auditLogger.log({
				correlationId,
				operation: 'escrow.dispute.sign',
				resourceType: 'dispute',
				resourceId: dispute.id,
				actorId: filerAddress ? AuditLogger.maskAddress(filerAddress) : undefined,
				status: 'success',
				durationMs: Date.now() - startTime,
				metadata: {
					type: 'file',
					transactionHash: txResponse.txHash,
					escrowId,
					milestoneId,
				},
			})

			return NextResponse.json(
				{
					success: true,
					message: 'Dispute filed successfully',
					data: {
						disputeId: dispute.id,
						transactionHash: txResponse.txHash,
						status: 'PENDING',
					},
				},
				{ status: 201 },
			)
		}

		if (type === 'resolve') {
			// Create a properly typed object for resolution details
			const resolutionDetails = {
				approverAmount,
				serviceProviderAmount,
				mediatorId,
			}

			// Update the dispute status in the database
			const { error: updateError } = await supabase
				.from('escrow_reviews')
				.update({
					status: resolution,
					resolution_text: resolutionNotes,
					reviewed_at: new Date().toISOString(),
					transaction_hash: txResponse.txHash,
					review_notes: JSON.stringify(resolutionDetails),
				})
				.eq('id', disputeId)

			if (updateError) {
				throw new Error(
					`Failed to update dispute status: ${updateError.message}`,
				)
			}

			// Get the dispute details
			const { data: dispute } = await supabase
				.from('escrow_reviews')
				.select('*, escrow_milestones!inner(escrow_id, id)')
				.eq('id', disputeId)
				.single()

			if (dispute) {
				// Update the milestone status based on the resolution
				const milestoneStatus =
					resolution === 'APPROVED' ? 'completed' : 'rejected'

				// Update milestone status with error handling
				const { error: milestoneUpdateError } = await supabase
					.from('escrow_milestones')
					.update({ status: milestoneStatus })
					.eq('id', dispute.escrow_milestones.id)

				if (milestoneUpdateError) {
					console.error(
						'Error updating milestone status:',
						milestoneUpdateError,
					)
					throw new Error(
						`Failed to update milestone status: ${milestoneUpdateError.message}`,
					)
				}

				// Get escrow contract details for notifications
				const { data: escrow, error: escrowError } = await supabase
					.from('escrow_contracts')
					.select('*')
					.eq('id', dispute.escrow_id)
					.single()

				if (escrowError) {
					console.error('Error fetching escrow contract:', escrowError)
					throw new Error(
						`Failed to fetch escrow contract: ${escrowError.message}`,
					)
				}

				// Create notifications for all parties involved
				if (escrow) {
					const { error: notificationError } = await supabase
						.from('notifications')
						.insert([
							{
								user_id: escrow.service_provider_id,
								review_id: disputeId,
								message: `Dispute resolution: ${resolution}. ${resolutionNotes}`,
								type: 'DISPUTE_RESOLVED',
							},
							{
								user_id: escrow.approver_id,
								review_id: disputeId,
								message: `Dispute resolution: ${resolution}. ${resolutionNotes}`,
								type: 'DISPUTE_RESOLVED',
							},
						])

					if (notificationError) {
						console.error('Error creating notifications:', notificationError)
						throw new Error(
							`Failed to create notifications: ${notificationError.message}`,
						)
					}
				}
			}

			await auditLogger.log({
				correlationId,
				operation: 'escrow.dispute.sign',
				resourceType: 'dispute',
				resourceId: disputeId,
				actorId: mediatorId ?? undefined,
				status: 'success',
				durationMs: Date.now() - startTime,
				metadata: {
					type: 'resolve',
					transactionHash: txResponse.txHash,
					resolution,
					approverAmount,
					serviceProviderAmount,
				},
			})

			return NextResponse.json(
				{
					success: true,
					message: 'Dispute resolved successfully',
					data: {
						disputeId,
						transactionHash: txResponse.txHash,
						status: resolution,
					},
				},
				{ status: 200 },
			)
		}

		return NextResponse.json(
			{ error: 'Invalid transaction type' },
			{ status: 400 },
		)
	} catch (error) {
		console.error('Dispute Sign Error:', error)

		await auditLogger.log({
			correlationId,
			operation: 'escrow.dispute.sign',
			resourceType: 'dispute',
			status: 'failure',
			errorCode: error instanceof AppError ? String(error.statusCode) : '500',
			durationMs: Date.now() - startTime,
			metadata: { error: error instanceof Error ? error.message : String(error) },
		})

		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: error.statusCode },
			)
		}

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}
