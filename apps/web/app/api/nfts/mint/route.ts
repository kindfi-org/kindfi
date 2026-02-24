import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOption } from "~/lib/auth/auth-options";
import { GamificationContractService } from "~/lib/stellar/gamification-contracts";
import {
  buildNFTMetadata,
  determineTier,
  generateTierSVG,
  uploadFileToIPFS,
  uploadMetadataToIPFS,
  type NFTTier,
} from "~/lib/services/pinata";

// Validate user_id and Stellar address formats
export function validateUUID(id: unknown) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

export function validateStellarAddress(addr: unknown) {
  return typeof addr === "string" && /^G[A-Z2-7]{55}$/i.test(addr);
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
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOption);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const isAdmin = session.user.role === "admin";

    // Determine userId: only allow override for admins
    let userId: string = session.user.id;
    if (body?.user_id) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!validateUUID(body.user_id)) {
        return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
      }
      userId = body.user_id;
    }

    // Determine stellarAddress: only allow override for admins
    let stellarAddress: string | null = null;
    if (body?.stellar_address) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!validateStellarAddress(body.stellar_address)) {
        return NextResponse.json(
          { error: "Invalid stellar_address" },
          { status: 400 },
        );
      }
      stellarAddress = body.stellar_address;
    }

    // Use service role client to bypass RLS
    const { supabase } = await import("@packages/lib/supabase");

    // Check if user already has an NFT
    const { data: existingNFT } = await supabase
      .from("user_nfts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingNFT) {
      return NextResponse.json({
        success: true,
        message: "User already has an NFT",
        nft: existingNFT,
      });
    }

    // Resolve Stellar address if not provided
    if (!stellarAddress) {
      const { data: devices } = await supabase
        .from("devices")
        .select("address")
        .eq("user_id", userId)
        .not("address", "eq", "0x")
        .not("address", "is", null)
        .limit(1);

      stellarAddress = devices?.[0]?.address ?? null;
    }

    if (!stellarAddress) {
      return NextResponse.json(
        { error: "No Stellar address found for user. Connect a wallet first." },
        { status: 400 },
      );
    }

    const nftContractAddress =
      process.env.NFT_CONTRACT_ADDRESS ||
      process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

    if (!nftContractAddress) {
      return NextResponse.json(
        { error: "NFT contract address not configured" },
        { status: 500 },
      );
    }

    if (!process.env.SOROBAN_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "SOROBAN_PRIVATE_KEY not configured" },
        { status: 500 },
      );
    }

    // Gather user stats for the NFT metadata
    const stats = await getUserStats(supabase, userId);
    const tier: NFTTier = determineTier(stats.impactScore);

    // Generate and upload tier image to IPFS via Pinata
    let imageUri = "";
    let imageIpfsHash = "";
    try {
      const svgContent = generateTierSVG(tier, 0); // Token ID 0 placeholder; will be updated
      const svgBuffer = Buffer.from(svgContent, "utf-8");
      const uploadResult = await uploadFileToIPFS(
        svgBuffer,
        `kindfi-kinder-${tier}-${userId.slice(0, 8)}.svg`,
        "image/svg+xml",
      );
      imageUri = uploadResult.ipfsUrl;
      imageIpfsHash = uploadResult.ipfsHash;
      console.log("[NFT Mint] Image uploaded to IPFS:", imageUri);
    } catch (err) {
      console.warn(
        "[NFT Mint] Failed to upload image to Pinata, using placeholder:",
        err,
      );
      imageUri = `https://kindfi.org/images/nft-${tier}.svg`;
    }

    // Upload metadata JSON to IPFS as backup
    let metadataIpfsHash = "";
    const nftMetadataJSON = buildNFTMetadata(tier, 0, stats, imageUri);
    try {
      const metaResult = await uploadMetadataToIPFS(
        nftMetadataJSON,
        `kindfi-kinder-metadata-${userId.slice(0, 8)}`,
      );
      metadataIpfsHash = metaResult.ipfsHash;
      console.log("[NFT Mint] Metadata uploaded to IPFS:", metaResult.ipfsUrl);
    } catch (err) {
      console.warn("[NFT Mint] Failed to upload metadata to Pinata:", err);
    }

    // Mint on-chain
    const contractService = new GamificationContractService();
    const mintResult = await contractService.mintNFT(nftContractAddress, {
      toAddress: stellarAddress,
      metadata: {
        name: nftMetadataJSON.name,
        description: nftMetadataJSON.description,
        imageUri,
        externalUrl: nftMetadataJSON.external_url,
        attributes: nftMetadataJSON.attributes,
      },
    });

    if (!mintResult.success) {
      console.error("[NFT Mint] On-chain mint failed:", mintResult.error);
      return NextResponse.json(
        { error: `Failed to mint NFT on-chain: ${mintResult.error}` },
        { status: 500 },
      );
    }

    const tokenId = mintResult.tokenId ?? 0;

    // Save to database
    const { data: nftRecord, error: dbError } = await supabase
      .from("user_nfts")
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
      .single();

    if (dbError) {
      console.error("[NFT Mint] Database insert failed:", dbError);
      // The on-chain mint succeeded, so we still return success
      return NextResponse.json({
        success: true,
        tokenId,
        tier,
        onChain: true,
        dbSaved: false,
        error: dbError.message,
      });
    }

    console.log("[NFT Mint] Successfully minted NFT:", {
      tokenId,
      tier,
      userId,
      stellarAddress,
    });

    return NextResponse.json({
      success: true,
      tokenId,
      tier,
      nft: nftRecord,
      imageUri,
    });
  } catch (error) {
    console.error("Error in POST /api/nfts/mint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Gather user stats for NFT metadata attributes.
 */
async function getUserStats(
  supabase: import("@packages/lib/types").TypedSupabaseClient,
  userId: string,
) {
  // Total donations count + amount
  const { data: contributions } = await supabase
    .from("contributions")
    .select("amount")
    .eq("contributor_id", userId);

  const totalDonations = contributions?.length ?? 0;
  const totalAmount =
    contributions?.reduce((sum, c) => sum + Number(c.amount ?? 0), 0) ?? 0;

  // Quest completions
  const { data: quests } = await supabase
    .from("user_quest_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("is_completed", true);

  const questsCompleted = quests?.length ?? 0;

  // Best streak
  const { data: streaks } = await supabase
    .from("user_streaks")
    .select("current_streak")
    .eq("user_id", userId)
    .order("current_streak", { ascending: false })
    .limit(1);

  const streakDays = streaks?.[0]?.current_streak ?? 0;

  // Referral count
  const { data: referrals } = await supabase
    .from("referral_records")
    .select("id")
    .eq("referrer_id", userId);

  const referralCount = referrals?.length ?? 0;

  // Impact score = donations * 10 + quests * 25 + streaks * 5 + referrals * 15
  const impactScore =
    totalDonations * 10 +
    questsCompleted * 25 +
    streakDays * 5 +
    referralCount * 15;

  return {
    impactScore,
    totalDonations,
    totalAmount,
    questsCompleted,
    streakDays,
    referralCount,
  };
}
