import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { CampaignGoalReachedEmail } from '../templates/campaign-goal-reached-email'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '../notification-helpers'

export async function sendCampaignGoalReachedNotifications({
	creatorId,
	projectId,
	projectTitle,
	projectSlug,
	targetAmount,
}: {
	creatorId: string
	projectId: string
	projectTitle: string
	projectSlug: string
	targetAmount: string
}) {
	// 1. Notify creator
	const creator = await getUserEmailAndName(creatorId)

	await createInAppNotification({
		userId: creatorId,
		title: 'Funding goal reached!',
		body: `Your project "${projectTitle}" has reached its funding goal of ${targetAmount}. Congratulations!`,
		type: 'success',
	})

	if (creator.email) {
		const wantsEmail = await getUserEmailPref(creatorId)
		if (wantsEmail) {
			await sendEmail({
				to: creator.email,
				subject: `🎯 "${projectTitle}" reached its funding goal!`,
				react: (
					<CampaignGoalReachedEmail
						recipientName={creator.displayName || 'there'}
						projectTitle={projectTitle}
						projectSlug={projectSlug}
						targetAmount={targetAmount}
						appUrl={appUrl}
						isCreator
					/>
				),
			})
		}
	}

	// 2. Notify all contributors (unique)
	const { data: contributors } = await supabaseServiceRole
		.from('contributions')
		.select('contributor_id')
		.eq('project_id', projectId)
		.neq('contributor_id', creatorId)

	if (!contributors?.length) return

	const uniqueContributorIds = [...new Set(contributors.map((c) => c.contributor_id))]

	for (const contributorId of uniqueContributorIds) {
		const contributor = await getUserEmailAndName(contributorId)

		await createInAppNotification({
			userId: contributorId,
			title: 'Campaign goal reached!',
			body: `"${projectTitle}", a project you support, has reached its funding goal of ${targetAmount}!`,
			type: 'success',
		})

		if (contributor.email) {
			const wantsEmail = await getUserEmailPref(contributorId)
			if (wantsEmail) {
				await sendEmail({
					to: contributor.email,
					subject: `Great news! "${projectTitle}" reached its funding goal`,
					react: (
						<CampaignGoalReachedEmail
							recipientName={contributor.displayName || 'there'}
							projectTitle={projectTitle}
							projectSlug={projectSlug}
							targetAmount={targetAmount}
							appUrl={appUrl}
							isCreator={false}
						/>
					),
				})
			}
		}
	}
}
