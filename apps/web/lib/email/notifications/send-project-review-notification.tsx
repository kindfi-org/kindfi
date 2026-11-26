import { logger } from '@/lib/logger'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '~/lib/email/notification-helpers'
import { ProjectReviewRequestedEmail } from '~/lib/email/templates/project-review-requested-email'
import { getPlatformAdminIds } from '~/lib/queries/admin/get-platform-admin-ids'

/**
 * Notifies all platform admins when a creator submits a project for review.
 */
export async function sendProjectReviewRequestNotification({
	projectTitle,
	projectSlug,
	creatorName,
}: {
	projectTitle: string
	projectSlug: string
	creatorName?: string
}): Promise<void> {
	const adminIds = await getPlatformAdminIds()
	if (adminIds.length === 0) {
		logger.warn('[ProjectReviewNotification] No platform admins found to notify')
		return
	}

	const submittedAt = new Date().toLocaleString('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short',
	})

	await Promise.all(
		adminIds.map(async (adminId) => {
			const admin = await getUserEmailAndName(adminId)

			await createInAppNotification({
				userId: adminId,
				title: 'Campaign review requested',
				body: `${creatorName ?? 'A creator'} submitted "${projectTitle}" for review.`,
				type: 'info',
			})

			if (!admin.email) return
			const wantsEmail = await getUserEmailPref(adminId)
			if (!wantsEmail) return

			await sendEmail({
				to: admin.email,
				subject: `Campaign review requested: ${projectTitle}`,
				react: (
					<ProjectReviewRequestedEmail
						recipientName={admin.displayName || 'Admin'}
						projectTitle={projectTitle}
						projectSlug={projectSlug}
						creatorName={creatorName}
						submittedAt={submittedAt}
						appUrl={appUrl}
					/>
				),
			})
		}),
	)
}
