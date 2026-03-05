import { supabase } from '@packages/lib/supabase'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import { milestoneReviewSchema } from '~/lib/schemas/escrow.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const validation = validateRequest(milestoneReviewSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const {
			milestoneId,
			reviewerId,
			status,
			comments,
			signer,
			escrowContractAddress,
		} = validation.data

		// Verify authenticated user matches reviewerId
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()
		if (authError || !user || user.id !== reviewerId) {
			return NextResponse.json(
				{
					error: 'Unauthorized: Reviewer ID does not match authenticated user',
				},
				{ status: 403 },
			)
		}

		// Step 1 & 2: Validate Milestone and Reviewer exist in parallel
		const [milestoneResult, reviewerResult] = await Promise.all([
			supabase
				.from('milestones')
				.select('id, title, order_index, project_id')
				.eq('id', milestoneId)
				.single(),
			supabase.from('reviewers').select('*').eq('id', reviewerId).single(),
		])

		const { data: milestone, error: milestoneError } = milestoneResult
		const { data: reviewer, error: reviewerError } = reviewerResult

		if (milestoneError || !milestone) {
			return NextResponse.json(
				{ error: 'Milestone not found' },
				{ status: 404 },
			)
		}

		if (reviewerError || !reviewer) {
			return NextResponse.json(
				{ error: 'Reviewer not authorized' },
				{ status: 403 },
			)
		}

		// * It shouldn't be "completed"... it should be "approved" however, there is an overlap with the old types with the new migrations.
		// TODO: Fix this in the DB and prior that, update here.
		const isApproved = status === 'completed'
		let escrowResponse = null

		// Step 3: Finalize Milestone On-Chain if Approved
		if (isApproved) {
			escrowResponse = await createEscrowRequest({
				action: 'approveMilestone',
				method: 'POST',
				data: { signer, contractId: escrowContractAddress },
			})

			if (!escrowResponse.unsignedTransaction) {
				throw new Error('Failed to retrieve unsigned transaction XDR')
			}
		}

		// TODO: Move this to FE for signatures
		// // Sign transaction
		// const signedTxXdr = signTransaction(
		//   escrowResponse.unsignedTransaction,
		//   Networks.TESTNET, // Change to MAINNET if in production
		//   signer,
		// );
		// if (!signedTxXdr) {
		//   throw new Error('Transaction signing failed');
		// }

		// TODO: Move this to BE for sending transaction
		// Send signed transaction on-chain
		// const txResponse = await sendTransaction(signedTxXdr);

		// if (!txResponse || !txResponse.txHash) {
		//   throw new Error('Failed to finalize milestone on-chain');
		// }

		// TODO: Move this to the BE to update the milestone status
		// // Step 5: Update Milestone Status in DB
		// const { data: updatedMilestone, error: updateError } = await supabase
		//   .from('escrow_milestones')
		//   .update({
		//     status,
		//     completed_at: isApproved ? new Date().toISOString() : null,
		//   })
		//   .eq('id', milestoneId)
		//   .select('*')
		//   .single();
		// if (updateError) {
		//   throw new Error('Failed to update milestone status');
		// }

		// Step 6: Save Review Comments
		const { error: commentError } = await supabase
			.from('review_comments')
			.insert({
				milestone_id: milestoneId,
				reviewer_id: reviewerId,
				comments,
			})

		if (commentError) {
			throw new AppError(
				`Failed to add review comments: ${commentError.message}`,
				500,
				commentError,
			)
		}

		// Step 7: Send email + in-app notification (when approved)
		if (isApproved) {
			const { data: project } = await supabaseServiceRole
				.from('projects')
				.select('title, slug, kindler_id')
				.eq('id', milestone.project_id)
				.single()

			if (project?.kindler_id) {
				import('~/lib/email/email-notification-service')
					.then(({ sendMilestoneApprovedNotification }) =>
						sendMilestoneApprovedNotification({
							userId: project.kindler_id,
							projectTitle: project.title ?? 'Your project',
							projectSlug: project.slug ?? '',
							milestoneTitle: milestone.title ?? undefined,
							milestoneIndex: milestone.order_index ?? 0,
						}),
					)
					.catch((err) =>
						console.error('[Escrow review] Notification error:', err),
					)
			}
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Milestone reviewed successfully',
				data: {
					// TODO: Return the updated milestone after signing and sending the transaction, not before
					// milestone: updatedMilestone,
					escrowResponse,
				},
			},
			{ status: 200 },
		)
	} catch (error) {
		console.error('Milestone Review Error:', error)

		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message, details: error.details },
				{ status: error.statusCode },
			)
		}

		if (error instanceof SyntaxError && error.message.includes('JSON')) {
			return NextResponse.json(
				{ error: 'Invalid JSON format in request body' },
				{ status: 400 },
			)
		}

		return NextResponse.json(
			{
				error: 'An unexpected error occurred',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 400 },
		)
	}
}
