import { type NextRequest, NextResponse } from 'next/server'
import { AppError } from '~/lib/error'
import { supabase } from '~/lib/supabase/config'
import type { MilestoneReviewPayload } from '~/lib/types/escrow/escrow-payload.types'
import { validateMilestoneReview } from '~/lib/validators/escrow'

export async function POST(req: NextRequest) {
	try {
		// Parse and validate the request body
		const reviewData: MilestoneReviewPayload = await req.json()
		const validationResult = validateMilestoneReview(reviewData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid milestone review data',
					details: validationResult.errors,
				},
				{ status: 400 },
			)
		}

		const { milestoneId, reviewerId, status, comments } = reviewData

		// Check if the milestone exists
		const { data: milestone, error: milestoneError } = await supabase
			.from('escrow_milestones')
			.select('*')
			.eq('id', milestoneId)
			.single()

		if (milestoneError || !milestone) {
			return NextResponse.json(
				{ error: 'Milestone not found' },
				{ status: 404 },
			)
		}

		// Validate reviewer authorization (Ensure the reviewer has the correct permissions)
		const { data: reviewer, error: reviewerError } = await supabase
			.from('reviewers')
			.select('*')
			.eq('id', reviewerId)
			.single()

		if (reviewerError || !reviewer) {
			return NextResponse.json(
				{ error: 'Reviewer not authorized' },
				{ status: 403 },
			)
		}

		// Update the milestone status
		const { data: updatedMilestone, error: updateError } = await supabase
			.from('escrow_milestones')
			.update({
				status,
				completed_at: status === 'approved' ? new Date().toISOString() : null,
			})
			.eq('id', milestoneId)
			.select('*')
			.single()

		if (updateError) {
			throw new Error('Failed to update milestone status')
		}

		// Add review comments
		const { error: commentError } = await supabase
			.from('review_comments')
			.insert({
				milestone_id: milestoneId,
				reviewer_id: reviewerId,
				comments,
			})

		if (commentError) {
			throw new Error('Failed to add review comments')
		}

		// Notify the user about the milestone review update
		const { error: notificationError } = await supabase
			.from('notifications')
			.insert({
				user_id: milestone.user_id, // Assuming user_id exists in `escrow_milestones`
				milestone_id: milestoneId,
				message: `Your milestone status has been updated to ${status}.`,
			})

		if (notificationError) {
			throw new Error('Failed to send notification')
		}

		// If APPROVED, trigger the blockchain state change (escrow fund release)
		if (status === 'approved') {
			// TODO: Call the blockchain smart contract function to release funds
			// Example: await releaseEscrowFunds(milestone.escrow_id);
		}

		return NextResponse.json(
			{
				message: 'Milestone reviewed successfully',
				milestone: updatedMilestone,
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

		return NextResponse.json(
			{ error: 'Internal server error during milestone review' },
			{ status: 500 },
		)
	}
}
