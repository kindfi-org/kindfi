import { FundsReleasedEmail } from '../templates/funds-released-email'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '../notification-helpers'

export async function sendFundsReleasedNotification({
	userId,
	projectTitle,
	projectSlug,
	amount,
}: {
	userId: string
	projectTitle: string
	projectSlug: string
	amount?: string
}) {
	const user = await getUserEmailAndName(userId)

	if (user.email) {
		const wantsEmail = await getUserEmailPref(userId)
		if (wantsEmail) {
			await sendEmail({
				to: user.email,
				subject: `Funds released for ${projectTitle}`,
				react: (
					<FundsReleasedEmail
						recipientName={user.displayName || 'there'}
						projectTitle={projectTitle}
						projectSlug={projectSlug}
						amount={amount}
						appUrl={appUrl}
					/>
				),
			})
		}
	}

	await createInAppNotification({
		userId,
		title: 'Funds released',
		body: `Escrow funds for "${projectTitle}" have been released and confirmed.`,
		type: 'success',
	})
}
