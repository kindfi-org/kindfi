import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '~/lib/email/notification-helpers'
import { MilestoneReviewDecisionEmail } from '~/lib/email/templates/milestone-review-decision-email'
import { MilestoneReviewRequestedEmail } from '~/lib/email/templates/milestone-review-requested-email'
import { getPlatformAdminIds } from '~/lib/queries/admin/get-platform-admin-ids'

type ReviewRequestContext = {
	projectTitle: string
	projectSlug: string
	milestoneIndex: number
	milestoneTitle?: string | null
	requestNotes?: string | null
	requesterId: string
	requesterName?: string | null
}

type ReviewDecisionContext = ReviewRequestContext & {
	reviewNotes?: string | null
	kindlerId: string
}

const notifyUser = async ({
	userId,
	title,
	body,
	type,
	emailSubject,
	emailReact,
}: {
	userId: string
	title: string
	body: string
	type: 'info' | 'success' | 'warning' | 'error'
	emailSubject: string
	emailReact: React.ReactElement
}) => {
	await createInAppNotification({ userId, title, body, type })

	const user = await getUserEmailAndName(userId)
	if (!user.email) return

	const wantsEmail = await getUserEmailPref(userId)
	if (!wantsEmail) return

	await sendEmail({
		to: user.email,
		subject: emailSubject,
		react: emailReact,
	})
}

export async function notifyAdminsOfMilestoneReviewRequest(
	ctx: ReviewRequestContext,
): Promise<void> {
	const adminIds = await getPlatformAdminIds()
	if (adminIds.length === 0) {
		logger.warn('[MilestoneReviewNotification] No platform admins found to notify')
		return
	}

	const releaseLabel = ctx.milestoneTitle
		? `Release ${ctx.milestoneIndex + 1}: ${ctx.milestoneTitle}`
		: `Release ${ctx.milestoneIndex + 1}`

	const body = `${ctx.requesterName ?? 'A project owner'} requested review for ${releaseLabel} on "${ctx.projectTitle}".`

	await Promise.all(
		adminIds.map(async (adminId) => {
			const admin = await getUserEmailAndName(adminId)
			await notifyUser({
				userId: adminId,
				title: 'Milestone review requested',
				body,
				type: 'info',
				emailSubject: `Milestone review requested: ${ctx.projectTitle}`,
				emailReact: (
					<MilestoneReviewRequestedEmail
						recipientName={admin.displayName || 'Admin'}
						projectTitle={ctx.projectTitle}
						projectSlug={ctx.projectSlug}
						milestoneTitle={ctx.milestoneTitle ?? undefined}
						milestoneIndex={ctx.milestoneIndex}
						requesterName={ctx.requesterName ?? undefined}
						requestNotes={ctx.requestNotes ?? undefined}
						appUrl={appUrl}
					/>
				),
			})
		}),
	)
}

export async function notifyOwnersOfMilestoneReviewDecision(
	decision: 'approved' | 'rejected',
	ctx: ReviewDecisionContext,
): Promise<void> {
	const recipientIds = new Set<string>([ctx.kindlerId, ctx.requesterId])

	const releaseLabel = ctx.milestoneTitle
		? `Release ${ctx.milestoneIndex + 1}: ${ctx.milestoneTitle}`
		: `Release ${ctx.milestoneIndex + 1}`

	const isApproved = decision === 'approved'
	const title = isApproved ? 'Milestone review approved' : 'Milestone review rejected'
	const body = isApproved
		? `Your review request for ${releaseLabel} on "${ctx.projectTitle}" was approved. An admin will proceed with escrow release.`
		: `Your review request for ${releaseLabel} on "${ctx.projectTitle}" was rejected.${ctx.reviewNotes ? ` Notes: ${ctx.reviewNotes}` : ''}`

	await Promise.all(
		[...recipientIds].map(async (userId) => {
			const user = await getUserEmailAndName(userId)
			await notifyUser({
				userId,
				title,
				body,
				type: isApproved ? 'success' : 'warning',
				emailSubject: `${title}: ${ctx.projectTitle}`,
				emailReact: (
					<MilestoneReviewDecisionEmail
						recipientName={user.displayName || 'there'}
						projectTitle={ctx.projectTitle}
						projectSlug={ctx.projectSlug}
						milestoneTitle={ctx.milestoneTitle ?? undefined}
						milestoneIndex={ctx.milestoneIndex}
						decision={decision}
						reviewNotes={ctx.reviewNotes ?? undefined}
						appUrl={appUrl}
					/>
				),
			})
		}),
	)
}

export async function getPendingMilestoneReviewCount(): Promise<number> {
	const { count, error } = await supabaseServiceRole
		.from('milestone_review_requests')
		.select('id', { count: 'exact', head: true })
		.eq('status', 'pending')

	if (error) {
		logger.error('[MilestoneReviewNotification] Failed to count pending reviews:', error)
		return 0
	}

	return count ?? 0
}
