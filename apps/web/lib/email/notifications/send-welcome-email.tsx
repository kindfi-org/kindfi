import { createInAppNotification, getUserEmailAndName, sendEmail } from '../notification-helpers'
import { WelcomeNewUserEmail } from '../templates/welcome-new-user-email'

export async function sendWelcomeEmail({
	userId,
	displayName,
	hasKyc = false,
}: {
	userId: string
	displayName: string
	hasKyc?: boolean
}) {
	const user = await getUserEmailAndName(userId)
	if (!user.email) return

	await sendEmail({
		to: user.email,
		subject: `Welcome to KindFi, ${displayName}!`,
		react: <WelcomeNewUserEmail displayName={displayName} hasKyc={hasKyc} />,
	})

	await createInAppNotification({
		userId,
		title: 'Welcome to KindFi!',
		body: 'Your account is ready. Start exploring projects and making an impact.',
		type: 'success',
	})
}
