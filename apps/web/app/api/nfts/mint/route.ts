import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { authorizeUserOverride } from '~/lib/auth/authorize-user-override'
import { Logger } from '~/lib/logger'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { mintNftSchema } from '~/lib/schemas/nft.schemas'
import { AuditLogger } from '~/lib/services/audit-logger'
import {
	buildNFTMetadata,
	determineTier,
	generateTierSVG,
	type NFTTier,
	uploadFileToIPFS,
	uploadMetadataToIPFS,
} from '~/lib/services/pinata'
import { resolveUserStellarAddress } from '~/lib/services/resolve-user-stellar-address'
import { getUserStats } from '~/lib/services/user-stats'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'
import { generateUniqueId } from '~/lib/utils/id'
import { validateRequest } from '~/lib/utils/validation'

/** Placeholder token_id while an on-chain mint is in progress. */
const PENDING_TOKEN_ID = -1

/** Rows with PENDING_TOKEN_ID older than this are treated as stale and reclaimed. */
const PENDING_STALE_MS = 10 * 60 * 1000

type UserNftRow = {
	id: string
	user_id: string
	token_id: number
	tier: string
	contract_address: string
	stellar_address: string
	image_ipfs_hash: string | null
	metadata_ipfs_hash: string | null
	created_at: string
}

function isMintComplete(nft: Pick<UserNftRow, 'token_id'>): boolean {
	return nft.token_id >= 0
}

function isPendingStale(createdAt: string): boolean {
	return Date.now() - new Date(createdAt).getTime() > PENDING_STALE_MS
}

/**
 * Claim a DB row before on-chain mint to serialize concurrent mint requests.
 * Returns `claimed: true` when this request owns the mint, or existing row details otherwise.
 */
async function claimMintSlot(
	supabase: Awaited<typeof import('@packages/lib/supabase')>['supabase'],
	params: {
		userId: string
		contractAddress: string
		stellarAddress: string
	},
): Promise<
	| { claimed: true; rowId: string }
	| { claimed: false; existing: UserNftRow; alreadyExists: true }
	| { claimed: false; mintInProgress: true }
> {
	const { data: existing } = await supabase
		.from('user_nfts')
		.select('*')
		.eq('user_id', params.userId)
		.eq('contract_address', params.contractAddress)
		.maybeSingle()

	if (existing) {
		if (isMintComplete(existing)) {
			return { claimed: false, existing, alreadyExists: true }
		}

		if (!isPendingStale(existing.created_at)) {
			return { claimed: false, mintInProgress: true }
		}

		await supabase.from('user_nfts').delete().eq('id', existing.id)
	}

	const { data: claimRow, error: claimError } = await supabase
		.from('user_nfts')
		.insert({
			user_id: params.userId,
			token_id: PENDING_TOKEN_ID,
			tier: 'bronze',
			contract_address: params.contractAddress,
			stellar_address: params.stellarAddress,
		})
		.select()
		.single()

	if (claimError) {
		if (claimError.code === '23505') {
			const { data: racedRow } = await supabase
				.from('user_nfts')
				.select('*')
				.eq('user_id', params.userId)
				.eq('contract_address', params.contractAddress)
				.single()

			if (racedRow && isMintComplete(racedRow)) {
				return { claimed: false, existing: racedRow, alreadyExists: true }
			}

			return { claimed: false, mintInProgress: true }
		}

		throw new Error(`Failed to claim NFT mint slot: ${claimError.message}`)
	}

	return { claimed: true, rowId: claimRow.id }
}

/**
 * POST /api/nfts/mint
 *
 * Mint a new KindFi Kinder NFT for a user.
 * Called automatically when a user first donates, or manually from the UI.
 *
 * Body: { user_id?: string, stellar_address?: string }
 * - Only admins may provide `user_id` or `stellar_address` overrides
 * - If user_id is not provided (or caller is non-admin), uses the session user
 * - If stellar_address is not provided, resolves from devices table
 */
async function mintHandler(req: NextRequest) {
	const auditLogger = new AuditLogger()
	const logger = new Logger()
	const correlationId = generateUniqueId('audit-')
	const startTime = Date.now()

	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(mintNftSchema, body)
		if (!validation.success) {
			await auditLogger.log({
				correlationId,
				operation: 'nft.mint',
				resourceType: 'nft',
				actorId: session.user.id,
				status: 'validation_error',
				durationMs: Date.now() - startTime,
			})
			return validation.response
		}
		const authorization = authorizeUserOverride({
			session,
			requestedUserId: validation.data.user_id,
			resource: 'mint NFTs',
		})
		if (!authorization.success) {
			await auditLogger.log({
				correlationId,
				operation: 'nft.mint',
				resourceType: 'nft',
				actorId: session.user.id,
				status: 'failure',
				errorCode: '403',
				durationMs: Date.now() - startTime,
				metadata: {
					reason: 'forbidden_user_override',
					requestedUserId: validation.data.user_id,
				},
			})
			return authorization.response
		}
		const { userId } = authorization

		// Use service role client to bypass RLS
		const { supabase } = await import('@packages/lib/supabase')

		let stellarAddress: string | null = validation.data.stellar_address || null

		if (!stellarAddress) {
			stellarAddress = await resolveUserStellarAddress(supabase, userId)
		}

		if (!stellarAddress) {
			return NextResponse.json(
				{ error: 'No Stellar address found for user. Connect a wallet first.' },
				{ status: 400 },
			)
		}

		const nftContractAddress =
			process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS

		if (!nftContractAddress) {
			return NextResponse.json({ error: 'NFT contract address not configured' }, { status: 500 })
		}

		if (!process.env.SOROBAN_PRIVATE_KEY) {
			return NextResponse.json({ error: 'SOROBAN_PRIVATE_KEY not configured' }, { status: 500 })
		}

		const claim = await claimMintSlot(supabase, {
			userId,
			contractAddress: nftContractAddress,
			stellarAddress,
		})

		if (!claim.claimed) {
			if ('alreadyExists' in claim && claim.alreadyExists) {
				await auditLogger.log({
					correlationId,
					operation: 'nft.mint',
					resourceType: 'nft',
					resourceId: claim.existing.id,
					actorId: session.user.id,
					status: 'success',
					durationMs: Date.now() - startTime,
					metadata: { alreadyExists: true, tier: claim.existing.tier },
				})
				return NextResponse.json({
					success: true,
					message: 'User already has an NFT',
					nft: claim.existing,
				})
			}

			return NextResponse.json(
				{
					success: false,
					error: 'An NFT mint is already in progress for this user. Try again shortly.',
				},
				{ status: 409 },
			)
		}

		const claimRowId = claim.rowId

		// Gather user stats for the NFT metadata
		const stats = await getUserStats({ supabase, userId })
		const tier: NFTTier = determineTier(stats.impactScore)

		// Generate and upload tier image to IPFS via Pinata
		let imageUri = ''
		let imageIpfsHash = ''
		try {
			const svgContent = generateTierSVG(tier, 0) // Token ID 0 placeholder; will be updated
			const svgBuffer = Buffer.from(svgContent, 'utf-8')
			const uploadResult = await uploadFileToIPFS(
				svgBuffer,
				`kindfi-kinder-${tier}-${userId.slice(0, 8)}.svg`,
				'image/svg+xml',
			)
			imageUri = uploadResult.ipfsUrl
			imageIpfsHash = uploadResult.ipfsHash
		} catch (err) {
			logger.warn({
				eventType: 'nft.mint.image_upload_failed',
				error: err instanceof Error ? err.message : String(err),
			})
			imageUri = `https://kindfi.org/images/nft-${tier}.svg`
		}

		// Upload metadata JSON to IPFS as backup
		let metadataIpfsHash = ''
		const nftMetadataJSON = buildNFTMetadata(tier, 0, stats, imageUri)
		try {
			const metaResult = await uploadMetadataToIPFS(
				nftMetadataJSON,
				`kindfi-kinder-metadata-${userId.slice(0, 8)}`,
			)
			metadataIpfsHash = metaResult.ipfsHash
		} catch (err) {
			logger.warn({
				eventType: 'nft.mint.metadata_upload_failed',
				error: err instanceof Error ? err.message : String(err),
			})
		}

		// Mint on-chain
		const contractService = new GamificationContractService()
		const mintResult = await contractService.mintNFT(nftContractAddress, {
			toAddress: stellarAddress,
			metadata: {
				name: nftMetadataJSON.name,
				description: nftMetadataJSON.description,
				imageUri,
				externalUrl: nftMetadataJSON.external_url,
				attributes: nftMetadataJSON.attributes,
			},
		})

		if (!mintResult.success) {
			logger.error({
				eventType: 'nft.mint.onchain_failed',
				error: mintResult.error,
			})
			await supabase.from('user_nfts').delete().eq('id', claimRowId)
			return NextResponse.json(
				{ error: `Failed to mint NFT on-chain: ${mintResult.error}` },
				{ status: 500 },
			)
		}

		const tokenId = mintResult.tokenId ?? 0

		// Finalize the claimed row with on-chain details
		const { data: nftRecord, error: dbError } = await supabase
			.from('user_nfts')
			.update({
				token_id: tokenId,
				tier,
				image_ipfs_hash: imageIpfsHash || null,
				metadata_ipfs_hash: metadataIpfsHash || null,
				updated_at: new Date().toISOString(),
			})
			.eq('id', claimRowId)
			.select()
			.single()

		if (dbError) {
			logger.error({
				eventType: 'nft.mint.db_update_failed',
				error: dbError.message,
				tokenId,
				userId,
			})
			await auditLogger.log({
				correlationId,
				operation: 'nft.mint',
				resourceType: 'nft',
				resourceId: claimRowId,
				actorId: session.user.id,
				status: 'failure',
				errorCode: '500',
				durationMs: Date.now() - startTime,
				metadata: {
					tokenId,
					tier,
					onChainMinted: true,
					dbError: dbError.message,
				},
			})
			return NextResponse.json(
				{
					success: false,
					partialFailure: true,
					onChain: true,
					dbSaved: false,
					tokenId,
					tier,
					reconciliationId: correlationId,
					error: dbError.message,
					message:
						'NFT minted on-chain but failed to save to your profile. We will sync automatically, or you can retry later.',
				},
				{ status: 500 },
			)
		}

		await auditLogger.log({
			correlationId,
			operation: 'nft.mint',
			resourceType: 'nft',
			resourceId: nftRecord?.id,
			actorId: session.user.id,
			status: 'success',
			durationMs: Date.now() - startTime,
			metadata: {
				tokenId,
				tier,
				stellarAddress: AuditLogger.maskAddress(stellarAddress),
				contractAddress: nftContractAddress,
			},
		})

		return NextResponse.json({
			success: true,
			tokenId,
			tier,
			nft: nftRecord,
			imageUri,
		})
	} catch (error) {
		logger.error({
			eventType: 'nft.mint.unhandled_error',
			error: error instanceof Error ? error.message : String(error),
		})
		await auditLogger.log({
			correlationId,
			operation: 'nft.mint',
			resourceType: 'nft',
			status: 'failure',
			errorCode: '500',
			durationMs: Date.now() - startTime,
			metadata: {
				error: error instanceof Error ? error.message : String(error),
			},
		})
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export const POST = withRateLimit(
	{
		preset: 'strict',
		identifier: async (req) => {
			const ip = req.headers.get('x-forwarded-for')
			const session = await getServerSession(nextAuthOption)
			return session?.user?.id ?? ip ?? 'anonymous'
		},
	},
	mintHandler,
)
