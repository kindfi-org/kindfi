import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '../notification-helpers'
import { NewProjectEmail } from '../templates/new-project-email'

export async function sendNewProjectEmails({
	projectTitle,
	projectSlug,
	creatorId,
	creatorName,
}: {
	projectTitle: string
	projectSlug: string
	creatorId: string
	creatorName?: string
}) {
	// 1. Email + in-app to project creator
	const creator = await getUserEmailAndName(creatorId)
	if (creator.email) {
		await sendEmail({
			to: creator.email,
			subject: `Your project "${projectTitle}" is live on KindFi`,
			react: (
				<NewProjectEmail
					recipientName={creator.displayName || 'there'}
					projectTitle={projectTitle}
					projectSlug={projectSlug}
					creatorName={creatorName}
					appUrl={appUrl}
					isCreator
				/>
			),
		})
	}
	await createInAppNotification({
		userId: creatorId,
		title: 'Project created',
		body: `Your project "${projectTitle}" has been created. Complete your setup within 7 days.`,
		type: 'success',
	})

	// 2. Email to followers of the creator (supporters who want new project alerts)
	const creatorDisplayName = creatorName ?? creator.displayName
	const { data: followers } = await supabaseServiceRole
		.from('user_follows')
		.select('follower_id')
		.eq('following_id', creatorId)

	if (followers?.length) {
		for (const { follower_id } of followers) {
			const follower = await getUserEmailAndName(follower_id)
			if (follower.email) {
				const wantsEmail = await getUserEmailPref(follower_id)
				if (wantsEmail) {
					await sendEmail({
						to: follower.email,
						subject: `New project: ${projectTitle} needs your support`,
						react: (
							<NewProjectEmail
								recipientName={follower.displayName || 'there'}
								projectTitle={projectTitle}
								projectSlug={projectSlug}
								creatorName={creatorDisplayName ?? undefined}
								appUrl={appUrl}
								isCreator={false}
							/>
						),
					})
				}
			}
			await createInAppNotification({
				userId: follower_id,
				title: 'New project in need',
				body: `${creatorDisplayName || 'A creator'} launched "${projectTitle}". Be one of the first to support it.`,
				type: 'info',
			})
		}
	}
}
