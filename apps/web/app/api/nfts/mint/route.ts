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
import { getUserStats } from '~/lib/services/user-stats'
import { GamificationContractService } from '~/lib/stellar/gamification-contracts'
import { generateUniqueId } from '~/lib/utils/id'
import { validateRequest } from '~/lib/utils/validation'

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

		let stellarAddress: string | null = validation.data.stellar_address || null

		// Use service role client to bypass RLS
		const { supabase } = await import('@packages/lib/supabase')

		// Check if user already has an NFT
		const { data: existingNFT } = await supabase
			.from('user_nfts')
			.select('*')
			.eq('user_id', userId)
			.single()

		if (existingNFT) {
			await auditLogger.log({
				correlationId,
				operation: 'nft.mint',
				resourceType: 'nft',
				resourceId: existingNFT.id,
				actorId: session.user.id,
				status: 'success',
				durationMs: Date.now() - startTime,
				metadata: { alreadyExists: true, tier: existingNFT.tier },
			})
			return NextResponse.json({
				success: true,
				message: 'User already has an NFT',
				nft: existingNFT,
			})
		}

		// Resolve Stellar address if not provided
		if (!stellarAddress) {
			const { data: devices } = await supabase
				.from('devices')
				.select('address')
				.eq('user_id', userId)
				.not('address', 'eq', '0x')
				.not('address', 'is', null)
				.limit(1)

			stellarAddress = devices?.[0]?.address ?? null
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
			return NextResponse.json(
				{ error: `Failed to mint NFT on-chain: ${mintResult.error}` },
				{ status: 500 },
			)
		}

		const tokenId = mintResult.tokenId ?? 0

		// Save to database
		const { data: nftRecord, error: dbError } = await supabase
			.from('user_nfts')
			.insert({
				user_id: userId,
				token_id: tokenId,
				tier,
				contract_address: nftContractAddress,
				stellar_address: stellarAddress,
				image_ipfs_hash: imageIpfsHash || null,
				metadata_ipfs_hash: metadataIpfsHash || null,
			})
			.select()
			.single()

		if (dbError) {
			logger.error({
				eventType: 'nft.mint.db_insert_failed',
				error: dbError.message,
			})
			// The on-chain mint succeeded, so we still return success
			return NextResponse.json({
				success: true,
				tokenId,
				tier,
				onChain: true,
				dbSaved: false,
				error: dbError.message,
			})
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
