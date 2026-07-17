import { MilestoneApprovedEmail } from '../templates/milestone-approved-email'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '../notification-helpers'

export async function sendMilestoneApprovedNotification({
	userId,
	projectTitle,
	projectSlug,
	milestoneTitle,
	milestoneIndex = 0,
}: {
	userId: string
	projectTitle: string
	projectSlug: string
	milestoneTitle?: string
	milestoneIndex?: number
}) {
	const user = await getUserEmailAndName(userId)

	if (user.email) {
		const wantsEmail = await getUserEmailPref(userId)
		if (wantsEmail) {
			await sendEmail({
				to: user.email,
				subject: `Milestone approved for ${projectTitle}`,
				react: (
					<MilestoneApprovedEmail
						recipientName={user.displayName || 'there'}
						projectTitle={projectTitle}
						projectSlug={projectSlug}
						milestoneTitle={milestoneTitle}
						milestoneIndex={milestoneIndex}
						appUrl={appUrl}
					/>
				),
			})
		}
	}

	await createInAppNotification({
		userId,
		title: 'Milestone approved',
		body: `A milestone for "${projectTitle}" has been approved. Funds are being released.`,
		type: 'success',
	})
}
