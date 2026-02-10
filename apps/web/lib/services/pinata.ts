/**
 * Pinata IPFS Service
 *
 * Handles uploading NFT images and metadata JSON to IPFS via Pinata.
 * Used by the NFT minting/evolving system to store tier artwork on IPFS.
 */

const PINATA_API_URL = 'https://api.pinata.cloud'

/** Use custom gateway (e.g. green-deep-emu-978.mypinata.cloud) or default */
function getPinataGateway(): string {
	const custom = process.env.PINATA_GATEWAY?.trim()
	if (custom) {
		const base = custom.startsWith('http') ? custom : `https://${custom}`
		return base.endsWith('/ipfs') ? base : `${base.replace(/\/$/, '')}/ipfs`
	}
	return 'https://gateway.pinata.cloud/ipfs'
}

interface PinataUploadResponse {
	IpfsHash: string
	PinSize: number
	Timestamp: string
}

interface NFTMetadataJSON {
	name: string
	description: string
	image: string
	external_url: string
	attributes: Array<{
		trait_type: string
		value: string
		display_type?: string
		max_value?: string
	}>
}

function getPinataHeaders(): Record<string, string> {
	const jwt = process.env.PINATA_JWT

	if (jwt) {
		return { Authorization: `Bearer ${jwt}` }
	}

	const apiKey = process.env.PINATA_API_KEY
	const apiSecret = process.env.PINATA_API_SECRET

	if (apiKey && apiSecret) {
		return {
			pinata_api_key: apiKey,
			pinata_secret_api_key: apiSecret,
		}
	}

	throw new Error('Pinata credentials not configured (PINATA_JWT or PINATA_API_KEY + PINATA_API_SECRET)')
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 */
export async function uploadMetadataToIPFS(
	metadata: NFTMetadataJSON,
	name?: string,
): Promise<{ ipfsHash: string; ipfsUrl: string }> {
	const headers = getPinataHeaders()

	const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
		method: 'POST',
		headers: {
			...headers,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			pinataContent: metadata,
			pinataMetadata: {
				name: name || `kindfi-nft-${Date.now()}`,
			},
		}),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Pinata upload failed (${response.status}): ${errorText}`)
	}

	const data = (await response.json()) as PinataUploadResponse
	const gateway = getPinataGateway()
	return {
		ipfsHash: data.IpfsHash,
		ipfsUrl: `${gateway}/${data.IpfsHash}`,
	}
}

/**
 * Upload a file (image buffer) to IPFS via Pinata.
 */
export async function uploadFileToIPFS(
	fileBuffer: Buffer | Uint8Array,
	fileName: string,
	mimeType = 'image/png',
): Promise<{ ipfsHash: string; ipfsUrl: string }> {
	const headers = getPinataHeaders()

	const formData = new FormData()
	// Buffer extends Uint8Array; Blob accepts it at runtime but TS types are strict
	const blob = new Blob([fileBuffer as BlobPart], { type: mimeType })
	formData.append('file', blob, fileName)
	formData.append(
		'pinataMetadata',
		JSON.stringify({ name: fileName }),
	)

	const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
		method: 'POST',
		headers,
		body: formData,
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Pinata file upload failed (${response.status}): ${errorText}`)
	}

	const data = (await response.json()) as PinataUploadResponse
	const gateway = getPinataGateway()
	return {
		ipfsHash: data.IpfsHash,
		ipfsUrl: `${gateway}/${data.IpfsHash}`,
	}
}

/**
 * Get the full IPFS gateway URL for a given hash.
 */
export function getIPFSUrl(hash: string): string {
	const gateway = getPinataGateway()
	if (hash.startsWith('ipfs://')) {
		return `${gateway}/${hash.replace('ipfs://', '')}`
	}
	if (hash.startsWith('http')) {
		return hash
	}
	return `${gateway}/${hash}`
}

// ============================================================================
// NFT Tier Definitions
// ============================================================================

export type NFTTier = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface TierConfig {
	name: string
	description: string
	minPoints: number
	governanceVotes: number
	color: string
}

export const TIER_CONFIGS: Record<NFTTier, TierConfig> = {
	bronze: {
		name: 'Bronze Kinder',
		description:
			'A Bronze-tier Kinder NFT, recognizing your first steps in making an impact through KindFi.',
		minPoints: 0,
		governanceVotes: 1,
		color: '#CD7F32',
	},
	silver: {
		name: 'Silver Kinder',
		description:
			'A Silver-tier Kinder NFT, celebrating your growing commitment to positive change on KindFi.',
		minPoints: 100,
		governanceVotes: 3,
		color: '#C0C0C0',
	},
	gold: {
		name: 'Gold Kinder',
		description:
			'A Gold-tier Kinder NFT, honoring your significant contributions and consistent giving on KindFi.',
		minPoints: 500,
		governanceVotes: 5,
		color: '#FFD700',
	},
	diamond: {
		name: 'Diamond Kinder',
		description:
			'A Diamond-tier Kinder NFT, the highest honor for exceptional impact and community leadership on KindFi.',
		minPoints: 2000,
		governanceVotes: 10,
		color: '#B9F2FF',
	},
}

/**
 * Determine which tier a user belongs to based on total points.
 */
export function determineTier(totalPoints: number): NFTTier {
	if (totalPoints >= TIER_CONFIGS.diamond.minPoints) return 'diamond'
	if (totalPoints >= TIER_CONFIGS.gold.minPoints) return 'gold'
	if (totalPoints >= TIER_CONFIGS.silver.minPoints) return 'silver'
	return 'bronze'
}

/**
 * Generate an SVG image for a given tier (used as placeholder artwork).
 * Returns the SVG as a UTF-8 string.
 */
export function generateTierSVG(tier: NFTTier, tokenId: number): string {
	const config = TIER_CONFIGS[tier]
	const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.color};stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:${config.color};stop-opacity:0.8"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" style="stop-color:${config.color};stop-opacity:0.6"/>
      <stop offset="100%" style="stop-color:${config.color};stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" rx="20" fill="url(#bg)"/>
  <circle cx="200" cy="160" r="80" fill="url(#glow)"/>
  <text x="200" y="130" text-anchor="middle" fill="${config.color}" font-size="48" font-family="serif" font-weight="bold">K</text>
  <text x="200" y="175" text-anchor="middle" fill="#333" font-size="14" font-family="sans-serif">KINDER</text>
  <text x="200" y="280" text-anchor="middle" fill="#333" font-size="28" font-family="sans-serif" font-weight="bold">${tierLabel}</text>
  <text x="200" y="310" text-anchor="middle" fill="#666" font-size="12" font-family="sans-serif">#${tokenId.toString().padStart(4, '0')}</text>
  <text x="200" y="370" text-anchor="middle" fill="#999" font-size="10" font-family="sans-serif">KindFi Reputation NFT</text>
</svg>`
}

/**
 * Build NFT metadata for a given tier and user stats.
 */
export function buildNFTMetadata(
	tier: NFTTier,
	tokenId: number,
	stats: {
		impactScore: number
		totalDonations: number
		questsCompleted: number
		streakDays: number
		referralCount: number
	},
	imageUri: string,
): NFTMetadataJSON {
	const config = TIER_CONFIGS[tier]

	return {
		name: `${config.name} #${tokenId.toString().padStart(4, '0')}`,
		description: config.description,
		image: imageUri,
		external_url: 'https://kindfi.org/profile?section=gamification',
		attributes: [
			{ trait_type: 'Tier', value: tier.charAt(0).toUpperCase() + tier.slice(1) },
			{
				trait_type: 'Impact Score',
				value: String(stats.impactScore),
				display_type: 'number',
			},
			{
				trait_type: 'Total Donations',
				value: String(stats.totalDonations),
				display_type: 'number',
			},
			{
				trait_type: 'Quests Completed',
				value: String(stats.questsCompleted),
				display_type: 'number',
			},
			{
				trait_type: 'Streak Days',
				value: String(stats.streakDays),
				display_type: 'number',
			},
			{
				trait_type: 'Referrals',
				value: String(stats.referralCount),
				display_type: 'number',
			},
			{
				trait_type: 'Governance Votes',
				value: String(config.governanceVotes),
				display_type: 'number',
			},
			{
				trait_type: 'Tier Color',
				value: config.color,
			},
		],
	}
}
