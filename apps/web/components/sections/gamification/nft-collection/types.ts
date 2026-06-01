export interface NFTAttribute {
	trait_type: string
	value: string
	display_type?: string
	max_value?: string
}

export interface NFTMetadata {
	name: string
	description: string
	image_uri: string
	external_url: string
	attributes: NFTAttribute[]
}

export interface NFT {
	tokenId: number
	owner: string
	metadata: NFTMetadata
}

export interface NFTCollectionResponse {
	success: boolean
	data: { nfts: NFT[]; total: number }
}

export interface UserNFTRecord {
	id: string
	user_id: string
	token_id: number
	tier: 'bronze' | 'silver' | 'gold' | 'diamond'
	contract_address: string
	stellar_address: string
	image_ipfs_hash: string | null
	minted_at: string
	evolved_at: string | null
}

export interface UserStats {
	impactScore: number
	totalDonations: number
	questsCompleted: number
	streakDays: number
	referralCount: number
}
