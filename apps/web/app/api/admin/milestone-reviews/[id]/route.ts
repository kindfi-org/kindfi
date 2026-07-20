import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { mapMilestoneReviewRequestRow } from '~/lib/queries/milestone-reviews/map-milestone-review-request'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'
import { notifyOwnersOfMilestoneReviewDecision } from '~/lib/services/milestone-review-notification.service'
import { updateMilestoneReviewRequestSchema } from '~/lib/validators/milestone-review-request'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const adminId = session?.user?.id

		if (!adminId || !(await isPlatformAdmin(adminId))) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { id } = await context.params
		const body = await request.json()
		const parsed = updateMilestoneReviewRequestSchema.safeParse(body)

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
		}

		const { status, reviewNotes } = parsed.data

		const { data: existing, error: fetchError } = await supabaseServiceRole
			.from('milestone_review_requests')
			.select(
				`
				id,
				project_id,
				escrow_contract_id,
				milestone_index,
				milestone_title,
				status,
				requester_id,
				reviewer_id,
				request_notes,
				review_notes,
				created_at,
				reviewed_at,
				project:project_id ( title, slug, kindler_id )
			`,
			)
			.eq('id', id)
			.maybeSingle()

		if (fetchError || !existing) {
			return NextResponse.json({ error: 'Review request not found' }, { status: 404 })
		}

		if (existing.status !== 'pending') {
			return NextResponse.json(
				{ error: 'Only pending review requests can be updated' },
				{ status: 409 },
			)
		}

		const { data: updated, error: updateError } = await supabaseServiceRole
			.from('milestone_review_requests')
			.update({
				status,
				reviewer_id: adminId,
				review_notes: reviewNotes?.trim() || null,
				reviewed_at: new Date().toISOString(),
			})
			.eq('id', id)
			.select(
				`
				id,
				project_id,
				escrow_contract_id,
				milestone_index,
				milestone_title,
				status,
				requester_id,
				reviewer_id,
				request_notes,
				review_notes,
				created_at,
				reviewed_at
			`,
			)
			.single()

		if (updateError || !updated) {
			logger.error(updateError)
			return NextResponse.json({ error: 'Failed to update review request' }, { status: 500 })
		}

		const projectRelation = existing.project as
			| { title: string; slug: string; kindler_id: string }
			| { title: string; slug: string; kindler_id: string }[]
			| null
		const project = Array.isArray(projectRelation) ? projectRelation[0] : projectRelation

		if (project) {
			void notifyOwnersOfMilestoneReviewDecision(status, {
				projectTitle: project.title,
				projectSlug: project.slug,
				milestoneIndex: existing.milestone_index,
				milestoneTitle: existing.milestone_title,
				requestNotes: existing.request_notes,
				requesterId: existing.requester_id,
				reviewNotes: reviewNotes?.trim() || null,
				kindlerId: project.kindler_id,
			}).catch((err) => {
				logger.error('[MilestoneReview] Owner notification failed:', err)
			})
		}

		return NextResponse.json({
			request: mapMilestoneReviewRequestRow(updated),
		})
	} catch (error) {
		logger.error(error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
