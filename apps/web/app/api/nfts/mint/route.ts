import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { headers } from 'next/headers'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { Logger } from '~/lib/logger'

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

const rateLimiter = new RateLimiter()
const logger = new Logger()

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
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOption)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting by client IP
    const headersList = await headers()
    const clientIp = headersList.get('x-forwarded-for') || 'unknown'

    const rateLimitResult = await rateLimiter.increment(clientIp, 'mintNFT')
    if (rateLimitResult.isBlocked) {
      logger.warn({
        eventType: 'RATE_LIMIT_EXCEEDED',
        clientIp,
        action: 'mintNFT',
      })
      return NextResponse.json(
        { error: 'Too many mint requests. Please try again later.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const userId = body.user_id || session.user.id
    let stellarAddress: string | null = body.stellar_address || null

    // Use service role client to bypass RLS
    const { supabase } = await import('@packages/lib/supabase')

    // Check if user already has an NFT
    const { data: existingNFT } = await supabase
      .from('user_nfts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingNFT) {
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
      process.env.NFT_CONTRACT_ADDRESS ||
      process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS

    if (!nftContractAddress) {
      return NextResponse.json(
        { error: 'NFT contract address not configured' },
        { status: 500 },
      )
    }

    if (!process.env.SOROBAN_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'SOROBAN_PRIVATE_KEY not configured' },
        { status: 500 },
      )
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
      console.log('[NFT Mint] Image uploaded to IPFS:', imageUri)
    } catch (err) {
      console.warn(
        '[NFT Mint] Failed to upload image to Pinata, using placeholder:',
        err,
      )
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
      console.log('[NFT Mint] Metadata uploaded to IPFS:', metaResult.ipfsUrl)
    } catch (err) {
      console.warn('[NFT Mint] Failed to upload metadata to Pinata:', err)
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
      console.error('[NFT Mint] On-chain mint failed:', mintResult.error)
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
      console.error('[NFT Mint] Database insert failed:', dbError)
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

    console.log('[NFT Mint] Successfully minted NFT:', {
      tokenId,
      tier,
      userId,
      stellarAddress,
    })

    return NextResponse.json({
      success: true,
      tokenId,
      tier,
      nft: nftRecord,
      imageUri,
    })
  } catch (error) {
    console.error('Error in POST /api/nfts/mint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
