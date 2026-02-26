import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	buildNFTMetadata,
	determineTier,
	generateTierSVG,
	type NFTTier,
	TIER_CONFIGS,
	uploadFileToIPFS,
	uploadMetadataToIPFS,
} from '~/lib/services/pinata'
import { IMPACT_SCORE_WEIGHTS } from '~/lib/services/user-stats'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'

// --- Rate Limiting Configuration ---
const rateLimitMaxRequests = 3
const rateLimitWindowSeconds = 60
// Module-level Redis singleton to avoid per-request connection churn
const redis = Redis.fromEnv()

/**
 * POST /api/nfts/evolve
 *
 * Evolve (upgrade tier of) an existing KindFi Kinder NFT.
 * Called after gamification events that may push the user to a higher tier.
 *
 * Body: { user_id?: string }
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const body = await req.json()
		const sessionUserId = session.user.id
		const requestedUserId = body.user_id

		let userId: string

		if (requestedUserId && requestedUserId !== sessionUserId) {
			const isAdmin = session.user.role === 'admin'

			if (!isAdmin) {
				return new Response(
					JSON.stringify({
						error:
							'Forbidden: Only administrators can evolve NFTs for other users.',
					}),
					{
						status: 403,
						headers: { 'Content-Type': 'application/json' },
					},
				)
			}
			userId = requestedUserId
		} else {
			userId = sessionUserId
		}

		if (!body.nft_id) {
			return new Response(
				JSON.stringify({ error: 'Bad Request: Missing nft_id in payload.' }),
				{ status: 400 },
			)
		}

		// --- Rate Limiting via Upstash Redis ---
		try {
			// Secure key using strictly the authenticated session identity
			const rateLimitKey = `rate_limit:nft_evolve:${session.user.id}`
			const MAX_REQUESTS = rateLimitMaxRequests
			const WINDOW_SECONDS = rateLimitWindowSeconds

			// Atomically increment and set TTL on first request using a Lua script
			// This prevents a leaked key (where INCR succeeds but EXPIRE fails)
			const requests = (await redis.eval(
				`local count = redis.call("INCR", KEYS[1])
                 if count == 1 then
                   redis.call("EXPIRE", KEYS[1], ARGV[1])
                 end
                 return count`,
				[rateLimitKey],
				[WINDOW_SECONDS],
			)) as number

			if (requests && requests > MAX_REQUESTS) {
				console.warn(
					'[Rate Limit Exceeded] User attempted to evolve NFT too frequently.',
				)
				return NextResponse.json(
					{ error: 'Too many requests. Please try again later.' },
					{
						status: 429,
						headers: {
							'Retry-After': WINDOW_SECONDS.toString(),
						},
					},
				)
			}
		} catch (redisError) {
			// Fail open: If Redis goes down, we log it but don't block the user from evolving their NFT
			console.error('[Rate Limiting] Redis error:', redisError)
		}
		// --- End Rate Limiting ---

		// Use service role client to bypass RLS
		const { supabase } = await import('@packages/lib/supabase')

		// Get user's existing NFT
		const { data: existingNFT, error: nftError } = await supabase
			.from('user_nfts')
			.select('*')
			.eq('user_id', userId)
			.single()

		if (nftError || !existingNFT) {
			return NextResponse.json(
				{ error: 'User does not have an NFT yet. Mint one first.' },
				{ status: 404 },
			)
		}

		const nftContractAddress =
			process.env.NFT_CONTRACT_ADDRESS ||
			process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS

		if (!nftContractAddress || !process.env.SOROBAN_PRIVATE_KEY) {
			return NextResponse.json(
				{ error: 'NFT contract or SOROBAN_PRIVATE_KEY not configured' },
				{ status: 500 },
			)
		}

		// Gather fresh user stats
		const stats = await getUserStats(supabase, userId)
		const newTier: NFTTier = determineTier(stats.impactScore)
		const currentTier = existingNFT.tier as NFTTier

		// Check if tier actually changed
		const tierOrder: NFTTier[] = ['bronze', 'silver', 'gold', 'diamond']
		const currentIdx = tierOrder.indexOf(currentTier)
		const newIdx = tierOrder.indexOf(newTier)

		if (newIdx <= currentIdx) {
			return NextResponse.json({
				success: true,
				message: 'No tier upgrade available',
				currentTier,
				impactScore: stats.impactScore,
				nextTierAt:
					newIdx < tierOrder.length - 1
						? TIER_CONFIGS[tierOrder[newIdx + 1] as NFTTier].minPoints
						: null,
			})
		}

		console.log('[NFT Evolve] Upgrading tier:', {
			userId,
			from: currentTier,
			to: newTier,
			impactScore: stats.impactScore,
		})

		// Generate and upload new tier image
		let imageUri = ''
		let imageIpfsHash = ''
		try {
			const svgContent = generateTierSVG(newTier, existingNFT.token_id)
			const svgBuffer = Buffer.from(svgContent, 'utf-8')
			const uploadResult = await uploadFileToIPFS(
				svgBuffer,
				`kindfi-kinder-${newTier}-${existingNFT.token_id}.svg`,
				'image/svg+xml',
			)
			imageUri = uploadResult.ipfsUrl
			imageIpfsHash = uploadResult.ipfsHash
		} catch (err) {
			console.warn(
				'[NFT Evolve] Failed to upload image, using placeholder:',
				err,
			)
			imageUri = `https://kindfi.org/images/nft-${newTier}.svg`
		}

		// Build new metadata
		const nftMetadataJSON = buildNFTMetadata(
			newTier,
			existingNFT.token_id,
			stats,
			imageUri,
		)

		// Upload metadata JSON to IPFS as backup
		let metadataIpfsHash = ''
		try {
			const metaResult = await uploadMetadataToIPFS(
				nftMetadataJSON,
				`kindfi-kinder-metadata-${existingNFT.token_id}-${newTier}`,
			)
			metadataIpfsHash = metaResult.ipfsHash
		} catch (err) {
			console.warn('[NFT Evolve] Failed to upload metadata to Pinata:', err)
		}

		// Update on-chain metadata
		const contractService = new GamificationContractService()
		const updateResult = await contractService.updateNFTMetadata(
			nftContractAddress,
			{
				tokenId: existingNFT.token_id,
				metadata: {
					name: nftMetadataJSON.name,
					description: nftMetadataJSON.description,
					imageUri,
					externalUrl: nftMetadataJSON.external_url,
					attributes: nftMetadataJSON.attributes,
				},
			},
		)

		if (!updateResult.success) {
			console.error('[NFT Evolve] On-chain update failed:', updateResult.error)
			return NextResponse.json(
				{ error: `Failed to update NFT on-chain: ${updateResult.error}` },
				{ status: 500 },
			)
		}

		// Update database record
		const { data: updatedNFT, error: dbError } = await supabase
			.from('user_nfts')
			.update({
				tier: newTier,
				image_ipfs_hash: imageIpfsHash || existingNFT.image_ipfs_hash,
				metadata_ipfs_hash: metadataIpfsHash || existingNFT.metadata_ipfs_hash,
				evolved_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq('id', existingNFT.id)
			.select()
			.single()

		if (dbError) {
			console.error('[NFT Evolve] Database update failed:', dbError)
		}

		console.log('[NFT Evolve] Successfully evolved NFT:', {
			tokenId: existingNFT.token_id,
			from: currentTier,
			to: newTier,
		})

		return NextResponse.json({
			success: true,
			evolved: true,
			previousTier: currentTier,
			newTier,
			tokenId: existingNFT.token_id,
			imageUri,
			nft: updatedNFT || existingNFT,
		})
	} catch (error) {
		console.error('Error in POST /api/nfts/evolve:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

/**
 * Gather user stats for NFT metadata attributes.
 */
async function getUserStats(
	supabase: import('@packages/lib/types').TypedSupabaseClient,
	userId: string,
) {
	const { data: contributions } = await supabase
		.from('contributions')
		.select('amount')
		.eq('contributor_id', userId)

	const totalDonations = contributions?.length ?? 0

	const { data: quests } = await supabase
		.from('user_quest_progress')
		.select('id')
		.eq('user_id', userId)
		.eq('is_completed', true)

	const questsCompleted = quests?.length ?? 0

	const { data: streaks } = await supabase
		.from('user_streaks')
		.select('current_streak')
		.eq('user_id', userId)
		.order('current_streak', { ascending: false })
		.limit(1)

	const streakDays = streaks?.[0]?.current_streak ?? 0

	const { data: referrals } = await supabase
		.from('referral_records')
		.select('id')
		.eq('referrer_id', userId)

	const referralCount = referrals?.length ?? 0

	// TODO: Refactor this local function to use the centralized getUserStats service from ~/lib/services/user-stats
	// This local implementation is kept temporarily to avoid breaking changes while API stabilization is in progress.
	const impactScore =
		totalDonations * IMPACT_SCORE_WEIGHTS.DONATIONS +
		questsCompleted * IMPACT_SCORE_WEIGHTS.QUESTS +
		streakDays * IMPACT_SCORE_WEIGHTS.STREAKS +
		referralCount * IMPACT_SCORE_WEIGHTS.REFERRALS

	return {
		impactScore,
		totalDonations,
		questsCompleted,
		streakDays,
		referralCount,
	}
}
