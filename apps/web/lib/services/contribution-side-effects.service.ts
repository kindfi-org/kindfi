import { supabase } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { NextRequest } from 'next/server'
import type { Session } from 'next-auth'
import { logger } from '@/lib/logger'
import { resolveUserStellarAddress } from '~/lib/services/resolve-user-stellar-address'

export type SendContributionNotificationsInput = {
	projectId: string | null
	contributorId: string
	amount: number
}

export type TriggerGamificationUpdatesInput = {
	session: Session
	amount: string | number
	req: NextRequest
	walletAddress?: string | null
}

export async function sendContributionNotifications(
	input: SendContributionNotificationsInput,
): Promise<void> {
	try {
		const { data: project } = await supabase
			.from('projects')
			.select('kindler_id, title, slug, target_amount, current_amount')
			.eq('id', input.projectId)
			.single()

		if (!project) return

		const { sendContributionNotifications, sendCampaignGoalReachedNotifications } = await import(
			'~/lib/email/email-notification-service'
		)

		const formattedAmount = `$${input.amount.toLocaleString()}`

		await sendContributionNotifications({
			contributorId: input.contributorId,
			creatorId: project.kindler_id,
			projectTitle: project.title,
			projectSlug: project.slug,
			amount: formattedAmount,
		})

		const newTotal = (project.current_amount ?? 0) + input.amount
		if (
			project.target_amount &&
			project.current_amount < project.target_amount &&
			newTotal >= project.target_amount
		) {
			await sendCampaignGoalReachedNotifications({
				creatorId: project.kindler_id,
				projectId: input.projectId as string,
				projectTitle: project.title,
				projectSlug: project.slug,
				targetAmount: `$${Number(project.target_amount).toLocaleString()}`,
			})
		}
	} catch (err) {
		logger.error('[Contributions] Notification error:', err)
	}
}

export async function triggerGamificationUpdates(
	input: TriggerGamificationUpdatesInput,
): Promise<void> {
	try {
		const donationTimestamp = new Date().toISOString()
		const userId = input.session.user.id
		const supabaseClient = await createSupabaseServerClient()
		const { supabase: serviceRoleClient } = await import('@packages/lib/supabase')

		const sessionDeviceAddress =
			input.session?.device?.address ?? input.session?.user?.device?.address ?? null

		const userStellarAddress = await resolveUserStellarAddress(serviceRoleClient, userId, {
			overrideAddress: input.walletAddress,
			sessionAddress: sessionDeviceAddress,
		})

		const { POST: streaksPOST } = await import('~/app/api/streaks/route')
		const { POST: referralsDonationPOST } = await import('~/app/api/referrals/donation/route')
		const { POST: questsProgressPOST } = await import('~/app/api/quests/progress/route')

		const createMockRequest = (body: Record<string, unknown>) => {
			return new Request('http://localhost/api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: input.req.headers.get('cookie') || '',
				},
				body: JSON.stringify(body),
			}) as NextRequest
		}

		const _streakResults = await Promise.allSettled([
			streaksPOST(
				createMockRequest({
					user_id: userId,
					period: 'weekly',
					donation_timestamp: donationTimestamp,
					user_address: userStellarAddress,
				}),
			)
				.then((response) => {
					return response
				})
				.catch((error) => {
					logger.error('[Gamification] Error updating weekly streak:', error)
					throw error
				}),
			streaksPOST(
				createMockRequest({
					user_id: userId,
					period: 'monthly',
					donation_timestamp: donationTimestamp,
					user_address: userStellarAddress,
				}),
			)
				.then((response) => {
					return response
				})
				.catch((error) => {
					logger.error('[Gamification] Error updating monthly streak:', error)
					throw error
				}),
		])

		referralsDonationPOST(
			createMockRequest({
				referred_id: userId,
				referred_address: userStellarAddress,
			}),
		)
			.then((response) => {
				return response
			})
			.catch((_error) => {
				// Silently fail if not a referred user or other error
			})

		const { data: donationQuests, error: questsError } = await supabaseClient
			.from('quest_definitions')
			.select('quest_id, quest_type, target_value')
			.eq('is_active', true)
			.in('quest_type', [
				'total_donation_amount',
				'multi_region_donation',
				'multi_category_donation',
			])

		if (questsError) {
			logger.error('[Gamification] Error fetching quests:', questsError)
		}

		if (donationQuests && donationQuests.length > 0) {
			for (const quest of donationQuests) {
				let progressValue = 0

				if (quest.quest_type === 'total_donation_amount') {
					const { data: allContributions } = await supabaseClient
						.from('contributions')
						.select('amount')
						.eq('contributor_id', userId)

					progressValue = allContributions
						? Math.floor(allContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0))
						: Number(input.amount)
				} else if (quest.quest_type === 'multi_region_donation') {
					const { data: uniqueProjects } = await supabaseClient
						.from('contributions')
						.select('project_id, projects!inner(category_id)')
						.eq('contributor_id', userId)

					progressValue =
						uniqueProjects?.filter(
							(p, index, self) =>
								index ===
								self.findIndex((pr) => pr.projects?.category_id === p.projects?.category_id),
						).length || 1
				} else if (quest.quest_type === 'multi_category_donation') {
					const { data: uniqueCategories } = await supabaseClient
						.from('contributions')
						.select('project_id, projects!inner(category_id)')
						.eq('contributor_id', userId)

					progressValue =
						uniqueCategories?.filter(
							(p, index, self) =>
								index ===
								self.findIndex((pr) => pr.projects?.category_id === p.projects?.category_id),
						).length || 1
				}

				questsProgressPOST(
					createMockRequest({
						user_id: userId,
						quest_id: quest.quest_id,
						progress_value: progressValue,
						user_address: userStellarAddress,
					}),
				)
					.then((response) => {
						return response
					})
					.catch((error) => {
						logger.error(`[Gamification] Error updating quest ${quest.quest_id}:`, error)
					})
			}
		}

		try {
			const { POST: nftMintPOST } = await import('~/app/api/nfts/mint/route')
			const { POST: nftEvolvePOST } = await import('~/app/api/nfts/evolve/route')

			const { supabase: svcClient } = await import('@packages/lib/supabase')
			// biome-ignore lint/suspicious/noExplicitAny: user_nfts table types pending regeneration
			const { data: existingNFT } = await (svcClient as any) // eslint-disable-line @typescript-eslint/no-explicit-any
				.from('user_nfts')
				.select('id, tier, token_id')
				.eq('user_id', userId)
				.single()

			const hasCompletedNft = existingNFT && existingNFT.token_id >= 0

			if (!hasCompletedNft) {
				const mintResponse = await nftMintPOST(
					createMockRequest({
						user_id: userId,
						stellar_address: userStellarAddress,
					}),
				)
				if (!mintResponse.ok) {
					const mintError = await mintResponse.json().catch(() => null)
					logger.error('[Gamification] NFT mint failed:', mintError)
				}
			} else {
				const evolveResponse = await nftEvolvePOST(createMockRequest({ user_id: userId }))
				if (!evolveResponse.ok) {
					const evolveError = await evolveResponse.json().catch(() => null)
					logger.error('[Gamification] NFT evolve failed:', evolveError)
				}
			}
		} catch (nftError) {
			logger.error('[Gamification] NFT mint/evolve error:', nftError)
		}
	} catch (error) {
		logger.error('[Gamification] Fatal error in gamification updates:', error)
	}
}
