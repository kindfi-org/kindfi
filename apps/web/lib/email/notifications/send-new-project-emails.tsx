import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import {
	appUrl,
	createInAppNotification,
	getUserEmailAndName,
	getUserEmailPref,
	sendEmail,
} from '../notification-helpers'
import { NewProjectEmail } from '../templates/new-project-email'

/**
 * Notifies the creator that their project has been submitted for admin review.
 * Does NOT notify followers — that happens only when an admin activates the project.
 */
export async function sendProjectSubmittedForReviewEmail({
	projectTitle,
	projectSlug,
	creatorId,
}: {
	projectTitle: string
	projectSlug: string
	creatorId: string
}) {
	const creator = await getUserEmailAndName(creatorId)
	if (creator.email) {
		await sendEmail({
			to: creator.email,
			subject: `Your project "${projectTitle}" is under review`,
			react: (
				<NewProjectEmail
					recipientName={creator.displayName || 'there'}
					projectTitle={projectTitle}
					projectSlug={projectSlug}
					appUrl={appUrl}
					isCreator
					isUnderReview
				/>
			),
		})
	}
	await createInAppNotification({
		userId: creatorId,
		title: 'Project submitted for review',
		body: `Your project "${projectTitle}" has been submitted and is awaiting admin review.`,
		type: 'success',
	})
}

/**
 * Notifies followers of a creator when their project becomes active.
 * Call this only after an admin activates the campaign.
 */
export async function sendProjectActivatedEmails({
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
	const creator = await getUserEmailAndName(creatorId)
	const creatorDisplayName = creatorName ?? creator.displayName

	// Notify creator that their campaign is now live
	if (creator.email) {
		await sendEmail({
			to: creator.email,
			subject: `Your campaign "${projectTitle}" is now live on KindFi`,
			react: (
				<NewProjectEmail
					recipientName={creator.displayName || 'there'}
					projectTitle={projectTitle}
					projectSlug={projectSlug}
					appUrl={appUrl}
					isCreator
				/>
			),
		})
	}
	await createInAppNotification({
		userId: creatorId,
		title: 'Campaign approved',
		body: `Your campaign "${projectTitle}" has been approved and is now live.`,
		type: 'success',
	})

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

/**
 * @deprecated Use sendProjectSubmittedForReviewEmail instead.
 * Kept for backwards-compatibility with existing callers.
 */
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
	await sendProjectSubmittedForReviewEmail({ projectTitle, projectSlug, creatorId })
	await sendProjectActivatedEmails({ projectTitle, projectSlug, creatorId, creatorName })
}
