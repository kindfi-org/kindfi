import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeProjectManage, getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getProjectReviewRequests } from '~/lib/queries/milestone-reviews/get-project-review-requests'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { validateMilestoneReviewEligibility } from '~/lib/services/milestone-review-eligibility.service'
import { notifyAdminsOfMilestoneReviewRequest } from '~/lib/services/milestone-review-notification.service'
import { createMilestoneReviewRequestSchema } from '~/lib/validators/milestone-review-request'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await context.params
		const projectId = await getProjectIdBySlug(slug)
		if (!projectId) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json(
				{ error: auth.status === 404 ? 'Project not found' : 'Forbidden' },
				{ status: auth.status },
			)
		}

		const requests = await getProjectReviewRequests(supabaseServiceRole, projectId)
		return NextResponse.json({ requests })
	} catch (error) {
		logger.error(error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await context.params
		const projectId = await getProjectIdBySlug(slug)
		if (!projectId) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json(
				{ error: auth.status === 404 ? 'Project not found' : 'Forbidden' },
				{ status: auth.status },
			)
		}

		const project = await getBasicProjectInfoBySlug(supabaseServiceRole, slug)
		if (!project?.escrowContractAddress) {
			return NextResponse.json(
				{ error: 'This project does not have an active escrow contract' },
				{ status: 400 },
			)
		}

		const body = await request.json()
		const parsed = createMilestoneReviewRequestSchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
		}

		const { milestoneIndex, requestNotes, milestoneTitle: clientTitle } = parsed.data

		const eligibility = await validateMilestoneReviewEligibility({
			escrowContractId: project.escrowContractAddress,
			milestoneIndex,
		})

		if (!eligibility.eligible) {
			return NextResponse.json({ error: eligibility.reason }, { status: 400 })
		}

		const milestoneTitle = clientTitle?.trim() || eligibility.milestoneTitle

		const { data: inserted, error: insertError } = await supabaseServiceRole
			.from('milestone_review_requests')
			.insert({
				project_id: projectId,
				escrow_contract_id: project.escrowContractAddress,
				milestone_index: milestoneIndex,
				milestone_title: milestoneTitle,
				status: 'pending',
				requester_id: userId,
				request_notes: requestNotes?.trim() || null,
			})
			.select('id, created_at')
			.single()

		if (insertError) {
			if (insertError.code === '23505') {
				return NextResponse.json(
					{ error: 'A review request for this milestone is already pending' },
					{ status: 409 },
				)
			}
			logger.error(insertError)
			return NextResponse.json({ error: 'Failed to create review request' }, { status: 500 })
		}

		const { data: requesterProfile } = await supabaseServiceRole
			.from('profiles')
			.select('display_name')
			.eq('id', userId)
			.maybeSingle()

		void notifyAdminsOfMilestoneReviewRequest({
			projectTitle: project.title,
			projectSlug: project.slug ?? slug,
			milestoneIndex,
			milestoneTitle,
			requestNotes: requestNotes?.trim() || null,
			requesterId: userId,
			requesterName: requesterProfile?.display_name ?? null,
		}).catch((err) => {
			logger.error('[MilestoneReview] Admin notification failed:', err)
		})

		return NextResponse.json({
			id: inserted.id,
			createdAt: inserted.created_at,
			status: 'pending',
		})
	} catch (error) {
		logger.error(error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
