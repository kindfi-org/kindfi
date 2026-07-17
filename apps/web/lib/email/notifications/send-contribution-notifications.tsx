import { ContributionConfirmedEmail } from '../templates/contribution-confirmed-email'
import { ContributionReceivedEmail } from '../templates/contribution-received-email'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '../notification-helpers'

export async function sendContributionNotifications({
	contributorId,
	creatorId,
	projectTitle,
	projectSlug,
	amount,
}: {
	contributorId: string
	creatorId: string
	projectTitle: string
	projectSlug: string
	amount: string
}) {
	const [contributor, creator] = await Promise.all([
		getUserEmailAndName(contributorId),
		getUserEmailAndName(creatorId),
	])

	// 1. In-app + email to project creator
	await createInAppNotification({
		userId: creatorId,
		title: 'New contribution received',
		body: `${contributor.displayName || 'A supporter'} contributed ${amount} to "${projectTitle}".`,
		type: 'success',
	})

	if (creator.email) {
		const wantsEmail = await getUserEmailPref(creatorId)
		if (wantsEmail) {
			await sendEmail({
				to: creator.email,
				subject: `New contribution received for "${projectTitle}"`,
				react: (
					<ContributionReceivedEmail
						recipientName={creator.displayName || 'there'}
						contributorName={contributor.displayName ?? undefined}
						projectTitle={projectTitle}
						projectSlug={projectSlug}
						amount={amount}
						appUrl={appUrl}
					/>
				),
			})
		}
	}

	// 2. In-app + email to the contributor confirming their donation
	await createInAppNotification({
		userId: contributorId,
		title: 'Contribution confirmed',
		body: `Thank you! Your contribution of ${amount} to "${projectTitle}" is confirmed.`,
		type: 'success',
	})

	if (contributor.email) {
		const wantsEmail = await getUserEmailPref(contributorId)
		if (wantsEmail) {
			await sendEmail({
				to: contributor.email,
				subject: `Your contribution to "${projectTitle}" is confirmed`,
				react: (
					<ContributionConfirmedEmail
						recipientName={contributor.displayName || 'there'}
						projectTitle={projectTitle}
						projectSlug={projectSlug}
						amount={amount}
						appUrl={appUrl}
					/>
				),
			})
		}
	}
}
