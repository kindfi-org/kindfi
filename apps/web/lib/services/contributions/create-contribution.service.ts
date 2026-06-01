import { supabase } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { NextRequest } from 'next/server'
import type { Session } from 'next-auth'

export type CreateContributionInput = {
	projectId?: string
	contractId?: string
	amount: number
	transactionHash?: string
	userId: string
	session: Session
	cookieHeader: string | null
}

export type CreateContributionResult =
	| {
			success: true
			contributionId: string
			status: 201
	  }
	| {
			success: true
			contributionId: string
			message: string
			status: 200
	  }
	| {
			success: false
			error: string
			details?: string
			status: 400 | 404 | 500
	  }

export type GamificationUpdateParams = {
	userId: string
	amount: number
	session: Session
	cookieHeader: string | null
}

export async function resolveProjectId(
	projectId?: string,
	contractId?: string,
): Promise<
	| { projectId: string }
	| { error: string; status: 404 }
> {
	let finalProjectId = projectId
	if (!finalProjectId && contractId) {
		const { data: escrowContract, error: escrowContractError } =
			await supabase
				.from('escrow_contracts')
				.select('project_id')
				.eq('contract_id', contractId)
				.single()

		if (escrowContractError || !escrowContract) {
			return {
				error: 'Escrow contract not found for the provided contract ID',
				status: 404,
			}
		}

		finalProjectId = escrowContract.project_id
	}

	return { projectId: finalProjectId as string }
}

export async function checkExistingContribution(
	transactionHash: string | undefined,
	projectId: string,
	userId: string,
): Promise<{ contributionId: string } | null> {
	if (!transactionHash) {
		return null
	}

	const { data: existingTransaction } = await supabase
		.from('transactions')
		.select('id')
		.eq('transaction_hash', transactionHash)
		.single()

	if (existingTransaction) {
		const { data: existingContribution } = await supabase
			.from('contributions')
			.select('id')
			.eq('project_id', projectId)
			.eq('contributor_id', userId)
			.single()

		if (existingContribution) {
			return { contributionId: existingContribution.id }
		}
	}

	return null
}

export async function createContributionRecord(
	projectId: string,
	userId: string,
	amount: number,
): Promise<
	| { contributionId: string }
	| { error: string; details: string }
> {
	const { data: contribution, error: contributionError } = await supabase
		.from('contributions')
		.insert({
			project_id: projectId,
			contributor_id: userId,
			amount: Number(amount),
		})
		.select('id')
		.single()

	if (contributionError) {
		console.error('Error creating contribution:', contributionError)
		return {
			error: 'Failed to create contribution',
			details: contributionError.message,
		}
	}

	const { error: updateError } = await supabase.rpc(
		'increment_project_amount',
		{
			project_id_param: projectId,
			amount_param: Number(amount),
		},
	)

	if (updateError) {
		const { data: project } = await supabase
			.from('projects')
			.select('current_amount')
			.eq('id', projectId)
			.single()

		if (project) {
			await supabase
				.from('projects')
				.update({
					current_amount: (project.current_amount || 0) + Number(amount),
				})
				.eq('id', projectId)
		}
	}

	return { contributionId: contribution.id }
}

export function triggerGamificationUpdates(
	params: GamificationUpdateParams,
): void {
	const gamificationUpdates = async () => {
		try {
			console.log('[Gamification] Starting gamification updates...')
			const donationTimestamp = new Date().toISOString()
			const { userId, amount, session, cookieHeader } = params
			console.log('[Gamification] User ID:', userId)
			const supabaseClient = await createSupabaseServerClient()

			let userStellarAddress: string | null = null

			if (session?.device?.address && session.device.address !== '0x') {
				userStellarAddress = session.device.address
				console.log(
					'[Gamification] Using smart account address from session:',
					userStellarAddress,
				)
			} else if (
				session?.user?.device?.address &&
				session.user.device.address !== '0x'
			) {
				userStellarAddress = session.user.device.address
				console.log(
					'[Gamification] Using smart account address from session.user:',
					userStellarAddress,
				)
			}

			if (!userStellarAddress) {
				try {
					const { data: devices, error: deviceError } = await supabaseClient
						.from('devices')
						.select('address')
						.eq('user_id', userId)
						.not('address', 'eq', '0x')
						.not('address', 'is', null)
						.limit(1)

					if (deviceError) {
						console.log(
							'[Gamification] Device lookup error:',
							deviceError.message,
						)
					} else if (devices && devices.length > 0 && devices[0]?.address) {
						userStellarAddress = devices[0].address
						console.log(
							'[Gamification] Using address from devices table:',
							userStellarAddress,
						)
					}
				} catch (error) {
					console.log('[Gamification] Error fetching device address:', error)
				}
			}

			console.log(
				'[Gamification] Final user Stellar address:',
				userStellarAddress || 'NOT FOUND',
			)

			console.log(
				'[Gamification] SOROBAN_PRIVATE_KEY available:',
				!!process.env.SOROBAN_PRIVATE_KEY,
			)
			console.log('[Gamification] Contract addresses:', {
				streak:
					process.env.STREAK_CONTRACT_ADDRESS ||
					process.env.NEXT_PUBLIC_STREAK_CONTRACT_ADDRESS ||
					'NOT SET',
				referral:
					process.env.REFERRAL_CONTRACT_ADDRESS ||
					process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS ||
					'NOT SET',
				quest:
					process.env.QUEST_CONTRACT_ADDRESS ||
					process.env.NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS ||
					'NOT SET',
			})

			const { POST: streaksPOST } = await import('~/app/api/streaks/route')
			const { POST: referralsDonationPOST } = await import(
				'~/app/api/referrals/donation/route'
			)
			const { POST: questsProgressPOST } = await import(
				'~/app/api/quests/progress/route'
			)

			const createMockRequest = (body: Record<string, unknown>) => {
				return new Request('http://localhost/api', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Cookie: cookieHeader || '',
					},
					body: JSON.stringify(body),
				}) as NextRequest
			}

			console.log('[Gamification] Updating streaks (weekly and monthly)...')
			const streakResults = await Promise.allSettled([
				streaksPOST(
					createMockRequest({
						user_id: userId,
						period: 'weekly',
						donation_timestamp: donationTimestamp,
						user_address: userStellarAddress,
					}),
				)
					.then((response) => {
						console.log(
							'[Gamification] Weekly streak update response:',
							response.status,
						)
						return response
					})
					.catch((error) => {
						console.error('[Gamification] Error updating weekly streak:', error)
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
						console.log(
							'[Gamification] Monthly streak update response:',
							response.status,
						)
						return response
					})
					.catch((error) => {
						console.error(
							'[Gamification] Error updating monthly streak:',
							error,
						)
						throw error
					}),
			])
			console.log(
				'[Gamification] Streak updates completed:',
				streakResults.map((r) => r.status),
			)

			console.log('[Gamification] Updating referral donation...')
			referralsDonationPOST(
				createMockRequest({
					referred_id: userId,
					referred_address: userStellarAddress,
				}),
			)
				.then((response) => {
					console.log(
						'[Gamification] Referral donation update response:',
						response.status,
					)
					return response
				})
				.catch((error) => {
					console.log(
						'[Gamification] Referral donation update skipped (not a referred user or error):',
						error.message,
					)
				})

			console.log('[Gamification] Fetching active donation quests...')
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
				console.error('[Gamification] Error fetching quests:', questsError)
			}

			console.log(
				'[Gamification] Found active quests:',
				donationQuests?.length || 0,
			)

			if (donationQuests && donationQuests.length > 0) {
				console.log(
					'[Gamification] Processing quests:',
					donationQuests.map((q) => ({ id: q.quest_id, type: q.quest_type })),
				)
				for (const quest of donationQuests) {
					let progressValue = 0

					if (quest.quest_type === 'total_donation_amount') {
						const { data: allContributions } = await supabaseClient
							.from('contributions')
							.select('amount')
							.eq('contributor_id', userId)

						progressValue = allContributions
							? Math.floor(
									allContributions.reduce(
										(sum, c) => sum + Number(c.amount || 0),
										0,
									),
								)
							: Number(amount)
					} else if (quest.quest_type === 'multi_region_donation') {
						const { data: uniqueProjects } = await supabaseClient
							.from('contributions')
							.select('project_id, projects!inner(category_id)')
							.eq('contributor_id', userId)

						progressValue =
							uniqueProjects?.filter(
								(p, index, self) =>
									index ===
									self.findIndex(
										(pr) =>
											pr.projects?.category_id === p.projects?.category_id,
									),
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
									self.findIndex(
										(pr) =>
											pr.projects?.category_id === p.projects?.category_id,
									),
							).length || 1
					}

					console.log(
						`[Gamification] Updating quest ${quest.quest_id} (${quest.quest_type}) with progress: ${progressValue}/${quest.target_value}`,
					)
					questsProgressPOST(
						createMockRequest({
							user_id: userId,
							quest_id: quest.quest_id,
							progress_value: progressValue,
							user_address: userStellarAddress,
						}),
					)
						.then((response) => {
							console.log(
								`[Gamification] Quest ${quest.quest_id} update response:`,
								response.status,
							)
							return response
						})
						.catch((error) => {
							console.error(
								`[Gamification] Error updating quest ${quest.quest_id}:`,
								error,
							)
						})
				}
			}

			console.log('[Gamification] Checking NFT status...')
			try {
				const { POST: nftMintPOST } = await import('~/app/api/nfts/mint/route')
				const { POST: nftEvolvePOST } = await import(
					'~/app/api/nfts/evolve/route'
				)

				const { supabase: svcClient } = await import('@packages/lib/supabase')
				// biome-ignore lint/suspicious/noExplicitAny: user_nfts table types pending regeneration
				const { data: existingNFT } = await (svcClient as any) // eslint-disable-line @typescript-eslint/no-explicit-any
					.from('user_nfts')
					.select('id, tier')
					.eq('user_id', userId)
					.single()

				if (!existingNFT) {
					console.log('[Gamification] No NFT found, minting new one...')
					const mintResponse = await nftMintPOST(
						createMockRequest({
							user_id: userId,
							stellar_address: userStellarAddress,
						}),
					)
					console.log('[Gamification] NFT mint response:', mintResponse.status)
				} else {
					console.log('[Gamification] Existing NFT found, checking evolution...')
					const evolveResponse = await nftEvolvePOST(
						createMockRequest({ user_id: userId }),
					)
					console.log(
						'[Gamification] NFT evolve response:',
						evolveResponse.status,
					)
				}
			} catch (nftError) {
				console.error('[Gamification] NFT mint/evolve error:', nftError)
			}
		} catch (error) {
			console.error('[Gamification] Fatal error in gamification updates:', error)
		} finally {
			console.log('[Gamification] Gamification updates completed')
		}
	}

	console.log('[Gamification] Triggering async gamification updates...')
	gamificationUpdates().catch((error) => {
		console.error('[Gamification] Unhandled error in gamification updates:', error)
	})
}

export async function createContribution(
	input: CreateContributionInput,
): Promise<CreateContributionResult> {
	const resolved = await resolveProjectId(input.projectId, input.contractId)

	if ('error' in resolved) {
		return {
			success: false,
			error: resolved.error,
			status: resolved.status,
		}
	}

	const finalProjectId = resolved.projectId

	if (!finalProjectId || !input.amount || input.amount <= 0) {
		return {
			success: false,
			error:
				'Invalid request. projectId (or contractId) and amount are required.',
			status: 400,
		}
	}

	const existing = await checkExistingContribution(
		input.transactionHash,
		finalProjectId,
		input.userId,
	)

	if (existing) {
		return {
			success: true,
			contributionId: existing.contributionId,
			message: 'Contribution already exists',
			status: 200,
		}
	}

	const created = await createContributionRecord(
		finalProjectId,
		input.userId,
		input.amount,
	)

	if ('error' in created) {
		return {
			success: false,
			error: created.error,
			details: created.details,
			status: 500,
		}
	}

	triggerGamificationUpdates({
		userId: input.userId,
		amount: input.amount,
		session: input.session,
		cookieHeader: input.cookieHeader,
	})

	return {
		success: true,
		contributionId: created.contributionId,
		status: 201,
	}
}
