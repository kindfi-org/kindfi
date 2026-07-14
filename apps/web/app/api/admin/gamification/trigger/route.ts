import { Keypair } from '@stellar/stellar-sdk'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	type ClientStellarNetworkId,
	STELLAR_MAINNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import { adminGamificationTriggerSchema } from '~/lib/schemas/admin-gamification-trigger.schemas'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'
import { GovernanceContractService } from '~/lib/stellar/governance-contract'
import { getStellarExplorerTxUrl } from '~/lib/utils/escrow/stellar-explorer'
import { validateRequest } from '~/lib/utils/validation'

function resolveNetworkId(): ClientStellarNetworkId {
	const passphrase = process.env.STELLAR_NETWORK_PASSPHRASE || process.env.NETWORK_PASSPHRASE || ''
	if (passphrase.includes(STELLAR_MAINNET_PASSPHRASE) || passphrase.includes('Public Global')) {
		return 'mainnet'
	}
	return 'testnet'
}

function requireEnv(name: string, fallback?: string): string | null {
	return process.env[name] || (fallback ? process.env[fallback] : undefined) || null
}

async function requireAdminApiUser(userId: string): Promise<boolean> {
	const { supabase } = await import('@packages/lib/supabase')
	const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
	return profile?.role === 'admin'
}

function buildResponse(
	result: {
		success: boolean
		txHash?: string
		error?: string
		[key: string]: unknown
	},
	module: string,
	action: string,
) {
	const network = resolveNetworkId()
	const explorerUrl = result.txHash ? getStellarExplorerTxUrl(result.txHash, network) : undefined

	if (!result.success) {
		return NextResponse.json(
			{
				success: false,
				module,
				action,
				error: result.error || 'Contract call failed',
				txHash: result.txHash,
				explorerUrl,
			},
			{ status: 502 },
		)
	}

	const { success: _s, error: _e, txHash, ...data } = result
	return NextResponse.json({
		success: true,
		module,
		action,
		txHash,
		explorerUrl,
		data,
	})
}

/**
 * POST /api/admin/gamification/trigger
 *
 * Admin-only: invoke gamification contract methods directly for mainnet/testnet
 * verification. Does not go through donation/user production flows or update
 * gamification DB tables — on-chain only.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		if (!(await requireAdminApiUser(session.user.id))) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		if (!process.env.SOROBAN_PRIVATE_KEY) {
			return NextResponse.json(
				{ error: 'SOROBAN_PRIVATE_KEY is not configured on the server' },
				{ status: 503 },
			)
		}

		const body = await req.json()
		const validation = validateRequest(adminGamificationTriggerSchema, body)
		if (!validation.success) {
			return validation.response
		}

		const input = validation.data
		logger.info('[AdminGamificationTrigger] Invoking', {
			adminId: session.user.id,
			module: input.module,
			action: input.action,
		})

		const contractService = new GamificationContractService()

		switch (input.module) {
			case 'streak': {
				const address = requireEnv('STREAK_CONTRACT_ADDRESS', 'NEXT_PUBLIC_STREAK_CONTRACT_ADDRESS')
				if (!address) {
					return NextResponse.json(
						{ error: 'STREAK_CONTRACT_ADDRESS not configured' },
						{ status: 503 },
					)
				}
				const result = await contractService.recordStreakDonation(address, {
					userAddress: input.userAddress,
					period: input.period,
					donationTimestamp: input.donationTimestamp ?? Math.floor(Date.now() / 1000),
				})
				return buildResponse(result, input.module, input.action)
			}

			case 'referral': {
				const address = requireEnv(
					'REFERRAL_CONTRACT_ADDRESS',
					'NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS',
				)
				if (!address) {
					return NextResponse.json(
						{ error: 'REFERRAL_CONTRACT_ADDRESS not configured' },
						{ status: 503 },
					)
				}

				if (input.action === 'create_referral') {
					// When omitted, use the recorder account as referrer so admins can
					// test with only their connected wallet (as the referred user).
					const referrerAddress =
						input.referrerAddress ||
						Keypair.fromSecret(process.env.SOROBAN_PRIVATE_KEY as string).publicKey()

					if (referrerAddress === input.referredAddress) {
						return NextResponse.json(
							{
								error:
									'Referrer and referred must differ. Connect a different wallet or pass referrerAddress.',
							},
							{ status: 400 },
						)
					}

					const result = await contractService.createReferral(address, {
						referrerAddress,
						referredAddress: input.referredAddress,
					})
					return buildResponse(result, input.module, input.action)
				}

				if (input.action === 'mark_onboarded') {
					const result = await contractService.markOnboarded(address, {
						referredAddress: input.referredAddress,
					})
					return buildResponse(result, input.module, input.action)
				}

				const result = await contractService.recordReferralDonation(address, {
					referredAddress: input.referredAddress,
				})
				return buildResponse(result, input.module, input.action)
			}

			case 'quest': {
				const address = requireEnv('QUEST_CONTRACT_ADDRESS', 'NEXT_PUBLIC_QUEST_CONTRACT_ADDRESS')
				if (!address) {
					return NextResponse.json(
						{ error: 'QUEST_CONTRACT_ADDRESS not configured' },
						{ status: 503 },
					)
				}
				const result = await contractService.updateQuestProgress(address, {
					userAddress: input.userAddress,
					questId: input.questId,
					progressValue: input.progressValue,
				})
				return buildResponse(result, input.module, input.action)
			}

			case 'nft': {
				const address = requireEnv('NFT_CONTRACT_ADDRESS', 'NEXT_PUBLIC_NFT_CONTRACT_ADDRESS')
				if (!address) {
					return NextResponse.json(
						{ error: 'NFT_CONTRACT_ADDRESS not configured' },
						{ status: 503 },
					)
				}

				const defaultMetadata = {
					name: 'KindFi Impact NFT (Admin Test)',
					description: 'Manually triggered mint for contract verification',
					imageUri: 'https://kindfi.org/images/nft-placeholder.png',
					externalUrl: 'https://kindfi.org/profile?section=gamification',
					attributes: [
						{ trait_type: 'Tier', value: 'Bronze' },
						{ trait_type: 'Source', value: 'Admin Trigger' },
					],
				}
				const metadata = input.metadata ?? defaultMetadata

				if (input.action === 'mint') {
					if (!input.toAddress) {
						return NextResponse.json({ error: 'toAddress is required for mint' }, { status: 400 })
					}
					const result = await contractService.mintNFT(address, {
						toAddress: input.toAddress,
						metadata,
					})
					return buildResponse(result, input.module, input.action)
				}

				if (input.tokenId == null) {
					return NextResponse.json(
						{ error: 'tokenId is required for update_metadata' },
						{ status: 400 },
					)
				}
				const result = await contractService.updateNFTMetadata(address, {
					tokenId: input.tokenId,
					metadata,
				})
				return buildResponse(result, input.module, input.action)
			}

			case 'reputation': {
				const address = requireEnv(
					'REPUTATION_CONTRACT_ADDRESS',
					'NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS',
				)
				if (!address) {
					return NextResponse.json(
						{ error: 'REPUTATION_CONTRACT_ADDRESS not configured' },
						{ status: 503 },
					)
				}
				const result = await contractService.recordReputationEvent(address, {
					userAddress: input.userAddress,
					eventType: input.eventType,
					points: input.points,
				})
				return buildResponse(result, input.module, input.action)
			}

			case 'governance': {
				if (!requireEnv('GOVERNANCE_CONTRACT_ADDRESS', 'NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS')) {
					return NextResponse.json(
						{ error: 'GOVERNANCE_CONTRACT_ADDRESS not configured' },
						{ status: 503 },
					)
				}
				const governance = new GovernanceContractService()
				const result = await governance.recordVote({
					voterAddress: input.voterAddress,
					roundId: input.roundId,
					optionId: input.optionId,
					voteType: input.voteType,
					tier: input.tier,
				})
				return buildResponse(result, input.module, input.action)
			}

			default: {
				return NextResponse.json({ error: 'Unsupported module' }, { status: 400 })
			}
		}
	} catch (error) {
		logger.error('[AdminGamificationTrigger] Unexpected error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}
