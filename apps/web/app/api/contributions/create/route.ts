import { supabase } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createContributionSchema } from '~/lib/schemas/contribution.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(createContributionSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { projectId, contractId, amount, transactionHash } = validation.data

		const numericAmount = Number(amount)
		const MAX_CONTRIBUTION_AMOUNT = 1_000_000

		if (
			typeof numericAmount !== 'number' ||
			Number.isNaN(numericAmount) ||
			numericAmount <= 0
		) {
			return NextResponse.json(
				{ error: 'Invalid request. amount must be a positive number.' },
				{ status: 400 },
			)
		}
		if (numericAmount > MAX_CONTRIBUTION_AMOUNT) {
			return NextResponse.json(
				{
					error: `Amount exceeds maximum allowed ($${MAX_CONTRIBUTION_AMOUNT.toLocaleString()}).`,
				},
				{ status: 400 },
			)
		}

		// Resolve project from contractId when provided (authoritative source for escrow)
		let finalProjectId: string | null = null
		if (contractId && typeof contractId === 'string') {
			const { data: escrowContract, error: escrowContractError } =
				await supabase
					.from('escrow_contracts')
					.select('project_id')
					.eq('contract_id', contractId)
					.maybeSingle()

			if (escrowContractError) {
				return NextResponse.json(
					{ error: 'Failed to verify escrow contract' },
					{ status: 500 },
				)
			}
			if (escrowContract?.project_id) finalProjectId = escrowContract.project_id
		}

		// If client sent projectId: when we have contractId, verify projectId matches (prevent attribution abuse)
		if (projectId && typeof projectId === 'string') {
			if (finalProjectId && projectId !== finalProjectId) {
				return NextResponse.json(
					{
						error:
							'Project does not match escrow contract. Use the contractId from the project page.',
					},
					{ status: 400 },
				)
			}
			// No contractId sent: use projectId (backward compat; prefer sending contractId)
			if (!finalProjectId) finalProjectId = projectId
		}


		// Check if contribution already exists for this transaction hash (to avoid duplicates)
		if (transactionHash) {
			const { data: existingTransaction } = await supabase
				.from('transactions')
				.select('id')
				.eq('transaction_hash', transactionHash)
				.single()

			if (existingTransaction) {
				// Check if contribution already exists for this transaction
				const { data: existingContribution } = await supabase
					.from('contributions')
					.select('id')
					.eq('project_id', finalProjectId)
					.eq('contributor_id', session.user.id)
					.single()

				if (existingContribution) {
					return NextResponse.json(
						{
							success: true,
							contributionId: existingContribution.id,
							message: 'Contribution already exists',
						},
						{ status: 200 },
					)
				}
			}
		}

		// Create contribution record
		const { data: contribution, error: contributionError } = await supabase
			.from('contributions')
			.insert({
				project_id: finalProjectId,
				contributor_id: session.user.id,
				amount: numericAmount,
			})
			.select('id')
			.single()

		if (contributionError) {
			console.error('Error creating contribution:', contributionError)
			return NextResponse.json(
				{
					error: 'Failed to create contribution',
					details: contributionError.message,
				},
				{ status: 500 },
			)
		}

		// Update project's current_amount (raised amount)
		const { error: updateError } = await supabase.rpc(
			'increment_project_amount',
			{
				project_id_param: finalProjectId,
				amount_param: numericAmount,
			},
		)

		// If RPC doesn't exist, fallback to manual update
		if (updateError) {
			const { data: project } = await supabase
				.from('projects')
				.select('current_amount')
				.eq('id', finalProjectId)
				.single()

			if (project) {
				await supabase
					.from('projects')
					.update({
						current_amount: (project.current_amount || 0) + numericAmount,
					})
					.eq('id', finalProjectId)
			}
		}

		// Trigger gamification updates (fire and forget - don't block response)
		// Call handlers directly to ensure they execute properly
		const gamificationUpdates = async () => {
			try {
				const donationTimestamp = new Date().toISOString()
				const userId = session.user.id
				const supabaseClient = await createSupabaseServerClient()

				// Get user's Stellar address for on-chain contract calls
				// Try multiple sources: smart account (devices table), session device, or request body
				let userStellarAddress: string | null = null

				// 1. Check session for device address (smart account)
				if (session?.device?.address && session.device.address !== '0x') {
					userStellarAddress = session.device.address
				} else if (
					session?.user?.device?.address &&
					session.user.device.address !== '0x'
				) {
					userStellarAddress = session.user.device.address
				}

				// 2. Check devices table (handle multiple devices - get first valid address)
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
						} else if (devices && devices.length > 0 && devices[0]?.address) {
							userStellarAddress = devices[0].address
						}
					} catch {
						// ignore device address fetch errors
					}
				}



				// Import handlers directly to avoid fetch issues
				const { POST: streaksPOST } = await import('~/app/api/streaks/route')
				const { POST: referralsDonationPOST } = await import(
					'~/app/api/referrals/donation/route'
				)
				const { POST: questsProgressPOST } = await import(
					'~/app/api/quests/progress/route'
				)

				// Create mock request objects for internal calls
				const createMockRequest = (body: Record<string, unknown>) => {
					return new Request('http://localhost/api', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Cookie: req.headers.get('cookie') || '',
						},
						body: JSON.stringify(body),
					}) as NextRequest
				}

				// 1. Update streaks (weekly and monthly) - includes on-chain contract calls if address available
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
							return response
						})
						.catch((error) => {
							console.error(
								'[Gamification] Error updating weekly streak:',
								error,
							)
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
							console.error(
								'[Gamification] Error updating monthly streak:',
								error,
							)
							throw error
						}),
				])

				// 2. Update referral donation (if user was referred) - includes on-chain contract calls if address available
				referralsDonationPOST(
					createMockRequest({
						referred_id: userId,
						referred_address: userStellarAddress,
					}),
				)
					.then((response) => {
						return response
					})
					.catch((error) => {
						// Silently fail if not a referred user or other error
					})

				// 3. Update quest progress for donation-related quests
				// Find active quests that match donation actions
				const { data: donationQuests, error: questsError } =
					await supabaseClient
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


				if (donationQuests && donationQuests.length > 0) {
					// Calculate progress for each quest type
					for (const quest of donationQuests) {
						let progressValue = 0

						if (quest.quest_type === 'total_donation_amount') {
							// Sum all user contributions
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
							// Count unique regions (simplified - using project categories as regions)
							// TODO: Add proper region tracking
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
							// Count unique categories
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

						// Update quest progress - includes on-chain contract calls if address available
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
								console.error(
									`[Gamification] Error updating quest ${quest.quest_id}:`,
									error,
								)
							})
					}
				}
				// 4. Handle NFT minting / evolution
				try {
					const { POST: nftMintPOST } = await import(
						'~/app/api/nfts/mint/route'
					)
					const { POST: nftEvolvePOST } = await import(
						'~/app/api/nfts/evolve/route'
					)

					// Check if user already has an NFT (user_nfts table recently added, types not yet regenerated)
					const { supabase: svcClient } = await import('@packages/lib/supabase')
					// biome-ignore lint/suspicious/noExplicitAny: user_nfts table types pending regeneration
					const { data: existingNFT } = await (svcClient as any) // eslint-disable-line @typescript-eslint/no-explicit-any
						.from('user_nfts')
						.select('id, tier')
						.eq('user_id', userId)
						.single()

					if (!existingNFT) {
						// First-time donor → mint Bronze NFT
						const mintResponse = await nftMintPOST(
							createMockRequest({
								user_id: userId,
								stellar_address: userStellarAddress,
							}),
						)
					} else {
						// Existing NFT → check if tier should evolve
						const evolveResponse = await nftEvolvePOST(
							createMockRequest({ user_id: userId }),
						)
					}
				} catch (nftError) {
					console.error('[Gamification] NFT mint/evolve error:', nftError)
				}
			} catch (error) {
				// Log but don't throw - gamification updates shouldn't block donations
				console.error(
					'[Gamification] Fatal error in gamification updates:',
					error,
				)
			} finally {
			}
		}

		// Trigger gamification updates asynchronously
		gamificationUpdates().catch((error) => {
			console.error(
				'[Gamification] Unhandled error in gamification updates:',
				error,
			)
		})

		return NextResponse.json(
			{
				success: true,
				contributionId: contribution.id,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error('Create contribution error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}
