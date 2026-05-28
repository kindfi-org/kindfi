import type { ReactElement } from 'react'
import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { getResendClient } from './resend-client'
import { CampaignGoalReachedEmail } from './templates/campaign-goal-reached-email'
import { ContributionConfirmedEmail } from './templates/contribution-confirmed-email'
import { ContributionReceivedEmail } from './templates/contribution-received-email'
import { FundsReleasedEmail } from './templates/funds-released-email'
import { MilestoneApprovedEmail } from './templates/milestone-approved-email'
import { NewProjectEmail } from './templates/new-project-email'
import { WelcomeNewUserEmail } from './templates/welcome-new-user-email'
import { logger } from '@/lib/logger'

const appConfig = appEnvConfig('web')

async function getUserEmailAndName(userId: string): Promise<{
	email: string | null
	displayName: string | null
}> {
	const { data, error } = await supabaseServiceRole
		.from('profiles')
		.select('email, display_name')
		.eq('id', userId)
		.single()

	if (error || !data) {
		return { email: null, displayName: null }
	}
	return {
		email: data.email ?? null,
		displayName: data.display_name ?? null,
	}
}

async function sendEmail({
	to,
	subject,
	react,
}: {
	to: string
	subject: string
	react: ReactElement
}): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClient()
		const from = `${appConfig.resend.fromName} <${appConfig.resend.fromEmail}>`

		const { error } = await resend.emails.send({
			from,
			to,
			subject,
			react,
		})

		if (error) {
			logger.error('[EmailNotificationService] Resend error:', error)
			return { success: false, error: error.message }
		}
		return { success: true }
	} catch (err) {
		logger.error('[EmailNotificationService] Send failed:', err)
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error',
		}
	}
}

async function createInAppNotification({
	userId,
	title,
	body,
	type = 'info' as const,
}: {
	userId: string
	title: string
	body: string
	type?: 'info' | 'success' | 'warning' | 'error'
}) {
	try {
		const { error } = await supabaseServiceRole.from('notifications').insert({
			user_id: userId,
			title,
			body,
			type,
		})
		if (error) {
			logger.error('[EmailNotificationService] In-app notification failed:', error)
		}
	} catch (err) {
		logger.error('[EmailNotificationService] In-app notification error:', err)
	}
}

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
	const appUrl = appConfig.deployment.appUrl

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
				const prefs = await supabaseServiceRole
					.from('notification_preferences')
					.select('email')
					.eq('user_id', follower_id)
					.single()
				const wantsEmail = prefs.data?.email !== false
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
	const appUrl = appConfig.deployment.appUrl

	if (user.email) {
		const prefs = await supabaseServiceRole
			.from('notification_preferences')
			.select('email')
			.eq('user_id', userId)
			.single()
		const wantsEmail = prefs.data?.email !== false
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
	const appUrl = appConfig.deployment.appUrl

	if (user.email) {
		const prefs = await supabaseServiceRole
			.from('notification_preferences')
			.select('email')
			.eq('user_id', userId)
			.single()
		const wantsEmail = prefs.data?.email !== false
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
		react: (
			<WelcomeNewUserEmail
				displayName={displayName}
				hasKyc={hasKyc}
			/>
		),
	})

	await createInAppNotification({
		userId,
		title: 'Welcome to KindFi!',
		body: 'Your account is ready. Start exploring projects and making an impact.',
		type: 'success',
	})
}

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
	const appUrl = appConfig.deployment.appUrl

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
		const prefs = await supabaseServiceRole
			.from('notification_preferences')
			.select('email')
			.eq('user_id', creatorId)
			.single()
		if (prefs.data?.email !== false) {
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
		const prefs = await supabaseServiceRole
			.from('notification_preferences')
			.select('email')
			.eq('user_id', contributorId)
			.single()
		if (prefs.data?.email !== false) {
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
	const appUrl = appConfig.deployment.appUrl

	// 1. Notify creator
	const creator = await getUserEmailAndName(creatorId)

	await createInAppNotification({
		userId: creatorId,
		title: 'Funding goal reached!',
		body: `Your project "${projectTitle}" has reached its funding goal of ${targetAmount}. Congratulations!`,
		type: 'success',
	})

	if (creator.email) {
		const prefs = await supabaseServiceRole
			.from('notification_preferences')
			.select('email')
			.eq('user_id', creatorId)
			.single()
		if (prefs.data?.email !== false) {
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

	const uniqueContributorIds = [
		...new Set(contributors.map((c) => c.contributor_id)),
	]

	for (const contributorId of uniqueContributorIds) {
		const contributor = await getUserEmailAndName(contributorId)

		await createInAppNotification({
			userId: contributorId,
			title: 'Campaign goal reached!',
			body: `"${projectTitle}", a project you support, has reached its funding goal of ${targetAmount}!`,
			type: 'success',
		})

		if (contributor.email) {
			const prefs = await supabaseServiceRole
				.from('notification_preferences')
				.select('email')
				.eq('user_id', contributorId)
				.single()
			if (prefs.data?.email !== false) {
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
