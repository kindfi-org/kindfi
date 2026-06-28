import { supabase } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { NextRequest } from 'next/server'
import type { Session } from 'next-auth'
import { logger } from '@/lib/logger'
import { getEscrowBalance } from '~/lib/services/escrow-balance.service'
import { resolveUserStellarAddress } from '~/lib/services/resolve-user-stellar-address'

export type ResolveProjectIdInput = {
	contractId?: string
	projectId?: string
}

export type ResolveProjectIdResult =
	| { success: true; projectId: string | null }
	| { success: false; error: string; status: 400 | 500 }

export type CheckDuplicateContributionResult =
	| { duplicate: true; contributionId: string }
	| { duplicate: false }

export type CreateContributionRecordResult =
	| { success: true; contributionId: string }
	| { success: false; error: string; details?: string }

export type CreateContributionWithProjectUpdateResult = CreateContributionRecordResult

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

export type FundraisingGoalCheckResult = { allowed: true } | { allowed: false; error: string }

export async function checkFundraisingGoalNotReached(
	projectId: string,
	contractId?: string,
): Promise<FundraisingGoalCheckResult> {
	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('target_amount, current_amount')
		.eq('id', projectId)
		.single()

	if (projectError || !project) {
		logger.error('Failed to load project for fundraising goal check:', projectError)
		return {
			allowed: false,
			error: 'Failed to verify project fundraising status',
		}
	}

	const targetAmount = Number(project.target_amount ?? 0)
	if (targetAmount <= 0) {
		return { allowed: true }
	}

	let escrowContractAddress = contractId

	if (!escrowContractAddress) {
		const { data: escrowContract } = await supabase
			.from('escrow_contracts')
			.select('contract_id')
			.eq('project_id', projectId)
			.maybeSingle()

		escrowContractAddress = escrowContract?.contract_id ?? undefined
	}

	const dbRaised = Number(project.current_amount ?? 0)
	const onChainRaised = escrowContractAddress ? await getEscrowBalance(escrowContractAddress) : null
	const effectiveRaised = onChainRaised ?? dbRaised

	if (effectiveRaised >= targetAmount) {
		return {
			allowed: false,
			error: 'This project has reached its fundraising goal and is no longer accepting donations.',
		}
	}

	return { allowed: true }
}

export async function resolveProjectId(
	input: ResolveProjectIdInput,
): Promise<ResolveProjectIdResult> {
	const { contractId, projectId } = input
	let finalProjectId: string | null = null

	if (contractId && typeof contractId === 'string') {
		const { data: escrowContract, error: escrowContractError } = await supabase
			.from('escrow_contracts')
			.select('project_id')
			.eq('contract_id', contractId)
			.maybeSingle()

		if (escrowContractError) {
			return {
				success: false,
				error: 'Failed to verify escrow contract',
				status: 500,
			}
		}
		if (escrowContract?.project_id) finalProjectId = escrowContract.project_id
	}

	if (projectId && typeof projectId === 'string') {
		if (finalProjectId && projectId !== finalProjectId) {
			return {
				success: false,
				error: 'Project does not match escrow contract. Use the contractId from the project page.',
				status: 400,
			}
		}
		if (!finalProjectId) finalProjectId = projectId
	}

	return { success: true, projectId: finalProjectId }
}

export async function checkDuplicateContribution(params: {
	transactionHash?: string
	projectId: string | null
	contributorId: string
}): Promise<CheckDuplicateContributionResult> {
	const { transactionHash, projectId, contributorId } = params

	if (!transactionHash) {
		return { duplicate: false }
	}

	const { data: existingTransaction } = await supabase
		.from('transactions')
		.select('id')
		.eq('transaction_hash', transactionHash)
		.single()

	if (!existingTransaction) {
		return { duplicate: false }
	}

	const { data: existingContribution } = await supabase
		.from('contributions')
		.select('id')
		.eq('project_id', projectId)
		.eq('contributor_id', contributorId)
		.single()

	if (existingContribution) {
		return { duplicate: true, contributionId: existingContribution.id }
	}

	return { duplicate: false }
}

export async function createContributionWithProjectUpdate(params: {
	projectId: string
	contributorId: string
	amount: number
}): Promise<CreateContributionWithProjectUpdateResult> {
	const { data: contributionId, error } = await supabase.rpc(
		'create_contribution_and_update_project',
		{
			p_project_id: params.projectId,
			p_contributor_id: params.contributorId,
			p_amount: params.amount,
		},
	)

	if (error || !contributionId) {
		logger.error('Error creating contribution with project update:', error)
		return {
			success: false,
			error: 'Failed to create contribution',
			details: error?.message ?? 'No contribution id returned',
		}
	}

	return { success: true, contributionId }
}

/** @deprecated Use createContributionWithProjectUpdate for atomic insert + project totals update. */
export async function createContributionRecord(params: {
	projectId: string | null
	contributorId: string
	amount: number
}): Promise<CreateContributionRecordResult> {
	if (!params.projectId) {
		return {
			success: false,
			error: 'Failed to create contribution',
			details: 'project_id is required',
		}
	}

	return createContributionWithProjectUpdate({
		projectId: params.projectId,
		contributorId: params.contributorId,
		amount: params.amount,
	})
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
