import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { authorizeProjectManage, getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { requireKycAuthorization } from '~/lib/kyc/denial'
import {
	isAllowedStatusTransition,
	PROJECT_STATUS_LABELS,
	type ProjectStatus,
} from '~/lib/projects/project-status'
import { recordAdminAudit } from '~/lib/services/admin-audit'

// Local Zod 4 enum — do not reuse @services/supabase projectStatusSchema (Zod 3).
const updateStatusBodySchema = z.object({
	status: z.enum(['draft', 'review', 'active', 'paused', 'funded', 'rejected']),
})

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
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

		const body = await request.json()
		const parsed = updateStatusBodySchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
		}

		const nextStatus = parsed.data.status as ProjectStatus

		if (!auth.access.isPlatformAdmin && nextStatus === 'review') {
			const kycDecision = await requireKycAuthorization({
				userId,
				action: 'submit_campaign',
			})
			if (!kycDecision.ok) {
				return kycDecision.response
			}
		}

		const { data: project, error: fetchError } = await supabaseServiceRole
			.from('projects')
			.select('id, status, title, kindler_id')
			.eq('id', projectId)
			.single()

		if (fetchError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const currentStatus = project.status as ProjectStatus

		if (
			!isAllowedStatusTransition({
				from: currentStatus,
				to: nextStatus,
				isPlatformAdmin: auth.access.isPlatformAdmin,
			})
		) {
			return NextResponse.json(
				{
					error: auth.access.isPlatformAdmin
						? `Cannot change status from ${PROJECT_STATUS_LABELS[currentStatus]} to ${PROJECT_STATUS_LABELS[nextStatus]}`
						: 'You can only mark a draft or rejected project as ready for review',
				},
				{ status: 403 },
			)
		}

		const { data: updated, error: updateError } = await supabaseServiceRole
			.from('projects')
			.update({ status: nextStatus })
			.eq('id', projectId)
			.select('id, status')
			.single()

		if (updateError || !updated) {
			logger.error(updateError)
			return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 })
		}

		// Campaign status changes made by platform admins are auditable.
		if (auth.access.isPlatformAdmin) {
			await recordAdminAudit({
				operation: 'admin_project_status_changed',
				resourceType: 'project',
				resourceId: projectId,
				actorId: userId,
				status: 'success',
				previousState: currentStatus,
				newState: nextStatus,
			})
		}

		// Non-blocking notifications based on new status
		if (nextStatus === 'review') {
			// Notify all admins that a campaign needs review
			const { data: creatorProfile } = await supabaseServiceRole
				.from('profiles')
				.select('display_name, full_name')
				.eq('id', project.kindler_id)
				.single()
			const creatorName = creatorProfile?.display_name ?? creatorProfile?.full_name ?? undefined

			import('~/lib/email/notifications/send-project-review-notification')
				.then(({ sendProjectReviewRequestNotification }) =>
					sendProjectReviewRequestNotification({
						projectTitle: project.title,
						projectSlug: slug,
						creatorName,
					}),
				)
				.catch((err) => logger.error('[Status PATCH] Admin review notification error:', err))
		} else if (nextStatus === 'active') {
			// Notify creator of approval and notify followers
			import('~/lib/email/notifications/send-new-project-emails')
				.then(({ sendProjectActivatedEmails }) =>
					sendProjectActivatedEmails({
						projectTitle: project.title,
						projectSlug: slug,
						creatorId: project.kindler_id,
					}),
				)
				.catch((err) => logger.error('[Status PATCH] Activation notification error:', err))
		} else if (nextStatus === 'rejected') {
			// Notify creator of rejection
			import('~/lib/email/notification-helpers')
				.then(({ createInAppNotification }) =>
					createInAppNotification({
						userId: project.kindler_id,
						title: 'Campaign rejected',
						body: `Your campaign "${project.title}" was not approved. Please review feedback from the admin team and resubmit.`,
						type: 'warning',
					}),
				)
				.catch((err) => logger.error('[Status PATCH] Rejection notification error:', err))
		}

		return NextResponse.json({
			id: updated.id,
			status: updated.status as ProjectStatus,
			label: PROJECT_STATUS_LABELS[updated.status as ProjectStatus],
		})
	} catch (error) {
		logger.error(error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
